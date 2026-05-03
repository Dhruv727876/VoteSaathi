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

## Testing

### Server Tests (Node/Express)
Run server-side integration and security tests:
```bash
cd server
npm test
```
**Test Coverage:**
- `health.test.js`: Verifies API health and performance.
- `chat.test.js`: Tests AI chat integration with mocking.
- `gemini.test.js`: Validates AI system prompt logic and persona switching.
- `security.test.js`: Checks input validation and XSS sanitization.

### Client Tests (React/Vite)
Run frontend component and hook tests:
```bash
cd client
npm test
```
**Test Coverage:**
- `useElectionChat.test.ts`: Integration tests for the core chat state and streaming hook.
- `PersonaSelector.test.tsx`: Validates persona selection and user context interaction.
- `MythBuster.test.tsx`: Tests pre-loaded and custom myth busting interactions.

## Project Structure
- `/client`: React frontend
- `/server`: Express backend & AI integration

