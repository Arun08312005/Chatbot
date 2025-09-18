# ChatGPT API Project (server + client)

This repository contains a minimal Node.js server that forwards requests to the OpenAI Chat Completions API, and a simple React client that talks to that server.

## Quick start (local)

1. Server:
   - `cd server`
   - `npm install`
   - create `.env` from `.env.example` and put your `OPENAI_API_KEY`
   - `npm start`
2. Client:
   - `cd client`
   - `npm install`
   - `npm start`
   - Open http://localhost:3000

## Security notes
- Never put your OpenAI API key in frontend code or commit it to a repo.
- When making a public deployment, add authentication and rate limits.
