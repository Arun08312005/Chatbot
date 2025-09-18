// server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function with retry + fallback
async function safeGenerateContent(input, retries = 3) {
  let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(input);
      return result.response.text();
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`⚠️ Gemini overloaded. Retrying in ${2 ** i}s...`);
        await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
        continue;
      }
      if (err.status === 503 && i === retries - 1) {
        console.warn("⚠️ Flash overloaded. Switching to Pro...");
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(input);
        return result.response.text();
      }
      throw err;
    }
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;

    const reply = await safeGenerateContent(userMessage);

    res.json({
      role: "assistant",
      content: reply,
    });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ role: "assistant", content: "❌ Error using Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
