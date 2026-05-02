# VoteSaathi 🇮🇳

An AI-powered Indian election guide.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS (Vite)
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.0 Flash (with Google Search Grounding)

## Getting Started

### Prerequisites
- Node.js
- Google Gemini API Key

### Setup

1. **Server Setup:**
   ```bash
   cd server
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   npm install
   npm run dev
   ```

2. **Client Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Project Structure
- `/client`: React frontend
- `/server`: Express backend & AI integration
