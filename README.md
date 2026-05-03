# VoteSaathi 🇮🇳

> Your AI-powered guide to navigating every stage of the Indian election process — from registration to results.

[![Built for Hack2Skill VirtualPromptWars](https://img.shields.io/badge/Hack2Skill-VirtualPromptWars-orange)](https://hack2skill.com)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.0%20Flash-blue)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Enabled-yellow)](https://firebase.google.com)

---

## 📖 Overview

VoteSaathi is a full-stack web application that empowers Indian voters with accurate, real-time election information. It uses Google Gemini 2.0 Flash with live Google Search grounding to answer voter questions, bust election myths with cited sources, and guide citizens through every phase of the democratic process — personalised to their voter profile.

---

## ✨ Features

| # | Feature | Description |
|---|---|---|
| 1 | **Persona-Aware AI Chat** | Select your voter type (First-time, Returning, NRI, Candidate) and get responses tailored to your specific needs and concerns. Powered by Gemini 2.0 Flash with Google Search grounding for live ECI data. |
| 2 | **Interactive Election Timeline** | A scrollable, stage-by-stage breakdown of the entire Indian election cycle — Announcement → Registration → Nomination → Campaigning → Polling → Counting — each card launching a contextual AI query. |
| 3 | **Election Myth Buster** | Tap any of 10 pre-loaded myths or type your own. The AI responds using a structured 4-section format (Myth / Truth / Data Point / Remember) with live cited sources. |
| 4 | **Voter Readiness Quiz** | A 5-question interactive quiz that calculates a readiness score and generates a personalised action plan. Results are persisted to Firestore so users pick up where they left off. |
| 5 | **Persistent Chat History** | Anonymous Firebase Authentication gives every visitor a persistent identity. Chat history and quiz progress are saved to Firestore and restored on return visits — no sign-up required. |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + TypeScript | UI framework with strict typing |
| **Vite** | Lightning-fast dev server and bundler with code splitting |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth tab transitions and card animations |
| **React.lazy + Suspense** | Per-tab code splitting — only active tab's JS is loaded |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **NVIDIA NIM API (Gemma)** | Primary AI inference endpoint |
| **Helmet.js** | HTTP security headers |
| **express-rate-limit** | Per-IP request throttling |
| **express-validator + xss** | Input validation and XSS sanitization |

### Google / Firebase Services
| Service | Purpose |
|---|---|
| **Gemini 2.0 Flash** | AI chat responses with real-time Google Search grounding |
| **Firebase Anonymous Auth** | Persistent user identity without requiring sign-up |
| **Cloud Firestore** | Stores chat history and quiz progress per user |
| **Firebase Hosting** | Static frontend hosting (GitHub Pages fallback) |
| **Firebase Analytics** | Event tracking (persona selected, myths busted, quiz completed) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                         │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ ChatInterface│  │ MythBuster   │  │  ReadinessChecker    │   │
│  │ (lazy)      │  │ (lazy)       │  │  (lazy)              │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                │                     │               │
│  ┌──────▼────────────────▼─────────────────────▼───────────┐   │
│  │              useElectionChat (useCallback)               │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │       Firebase SDK (Auth · Firestore · Analytics)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTPS (streaming SSE)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express API Server (Render)                        │
│                                                                 │
│   POST /api/chat/stream   POST /api/mythbust/stream             │
│                                                                 │
│   ┌─────────────────┐   ┌──────────────────────────────────┐   │
│   │  Rate Limiter   │   │  Input Validator + XSS Filter    │   │
│   └────────┬────────┘   └──────────────────────────────────┘   │
│            │                                                    │
└────────────┼────────────────────────────────────────────────────┘
             │  HTTPS
             ▼
┌─────────────────────────────────────────────────────────────────┐
│       Gemini 2.0 Flash  (Google AI / NVIDIA NIM)                │
│                                                                 │
│   • System prompt per persona (firstTimeVoter / nriVoter …)    │
│   • Google Search grounding for live ECI data                   │
│   • Streaming response (Server-Sent Events)                     │
└─────────────────────────────────────────────────────────────────┘

Firestore document layout:
  chatHistory/{uid}     → { messages: Message[] }   (last 20)
  userProgress/{uid}    → { score, gaps, timestamp }
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js ≥ 18
- A [Firebase project](https://console.firebase.google.com) with **Anonymous Auth** and **Firestore** enabled
- A [NVIDIA NIM API key](https://build.nvidia.com) **or** a [Google Gemini API key](https://ai.google.dev)

### 1 — Clone the repo

```bash
git clone https://github.com/Dhruv727876/VoteSaathi.git
cd VoteSaathi
```

### 2 — Server setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
```

```bash
npm install
npm run dev          # starts on http://localhost:5000
```

### 3 — Client setup

```bash
cd ../client
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

```bash
npm install
npm run dev          # starts on http://localhost:5173
```

---

## 🧪 Testing

### Server tests (Vitest + Supertest)

```bash
cd server
npm test             # runs all tests with coverage
npm run test:watch   # interactive watch mode
```

| Test file | What it covers |
|---|---|
| `health.test.js` | API health endpoint and response time |
| `chat.test.js` | AI chat integration with mocked AI responses |
| `gemini.test.js` | System prompt logic and persona switching |
| `security.test.js` | Input validation (length, persona allowlist, XSS sanitization) |

**Validation behaviour verified:**

```
POST /api/chat  { message: "a".repeat(1001) }  →  400 "Message must be between 1 and 1000 characters"
POST /api/chat  { persona: "hacker" }           →  400 "Invalid persona"
POST /api/chat  { message: "<script>…</script>" } →  200  (script tag stripped by xss())
```

### Client tests (Vitest + React Testing Library)

```bash
cd client
npm test
```

| Test file | What it covers |
|---|---|
| `useElectionChat.test.ts` | Core chat state, streaming, Firestore persistence |
| `PersonaSelector.test.tsx` | Persona selection and UserContext interaction |
| `MythBuster.test.tsx` | Pre-loaded and custom myth-busting interactions |
| `ChatInterface.test.tsx` | Message rendering, send flow, loading state |

---

## ☁️ Google Services Used

| Google Product | Integration point |
|---|---|
| **Gemini 2.0 Flash** | AI responses via `@google/generative-ai` SDK; Google Search grounding for live ECI data |
| **Firebase Anonymous Authentication** | `signInAnonymously()` on app load — every visitor gets a persistent UID with zero friction |
| **Cloud Firestore** | `chatHistory/{uid}` (last 20 messages) · `userProgress/{uid}` (quiz score + gaps) |
| **Firebase Hosting** | Production static hosting for the React build |
| **Firebase Analytics** | Custom events: `persona_selected`, `timeline_stage_viewed`, `myth_busted`, `readiness_check_completed`, `readiness_shared` |
| **Firebase Security Rules** | Document-level rules: `request.auth.uid == userId` — users can only read/write their own data |

---

## 📁 Project Structure

```
VoteSaathi/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx   # AI chat UI with streaming
│   │   │   ├── ElectionTimeline.tsx# Interactive timeline (lazy, memoized)
│   │   │   ├── MythBuster.tsx      # Myth busting UI (lazy, memoized)
│   │   │   ├── PersonaSelector.tsx # Voter persona selection (memoized)
│   │   │   └── ReadinessChecker.tsx# Voter readiness quiz (lazy)
│   │   ├── hooks/
│   │   │   ├── useElectionChat.ts  # Chat state, streaming, Firestore sync
│   │   │   ├── useAuth.ts          # Firebase anonymous auth
│   │   │   └── useUserProgress.ts  # Firestore quiz progress persistence
│   │   ├── context/
│   │   │   └── UserContext.tsx     # Persona state (React Context)
│   │   ├── firebase.ts             # Firebase app, auth, db, analytics
│   │   └── App.tsx                 # Root: auth gate, tabs, lazy loading
│   └── .env                        # Firebase + API config
│
├── server/                         # Express backend
│   ├── index.js                    # Routes, CORS, validation, rate limiting
│   ├── nvidia.js                   # Gemini/NVIDIA NIM integration + streaming
│   ├── middleware/
│   │   ├── rateLimiter.js          # express-rate-limit config
│   │   └── validateChat.js         # express-validator + xss sanitizer
│   └── .env                        # API keys
│
├── firestore.rules                 # Firestore security rules
└── README.md
```

---

## 📜 License

Built for [Hack2Skill VirtualPromptWars](https://hack2skill.com) · Data sourced from [eci.gov.in](https://eci.gov.in) · *A smarter democracy starts with an informed voter.*
