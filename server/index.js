import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { askElectionAssistant, askElectionAssistantStream } from './nvidia.js';
import { chatLimiter, mythLimiter } from './middleware/rateLimiter.js';
import { validateChatInput, validateMythInput } from './middleware/validateChat.js';

dotenv.config();

// STEP 5: Add environment variable validation on server startup
const REQUIRED_ENV_VARS = ["NVIDIA_API_KEY", "PORT"]; // Using NVIDIA_API_KEY as currently active
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("Missing required environment variables:", missing.join(", "));
  process.exit(1);
}

console.log('DEBUG: NVIDIA_API_KEY present:', !!process.env.NVIDIA_API_KEY);
console.log('DEBUG: Current directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// STEP 2: Add helmet.js
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.nvidia.com", "https://generativelanguage.googleapis.com", "https://firebaseapp.com"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:"],
  },
}));

// STEP 8: Add CORS hardening
const allowedOrigins = [
  "http://localhost:5173", // Vite default
  "http://localhost:3000",
  "https://dhruv727876.github.io", // GitHub Pages
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// STEP 3 & 4: Apply Rate Limiting and Validation
app.post('/api/chat', chatLimiter, validateChatInput, async (req, res, next) => {
  try {
    const { message, persona, history } = req.body;
    console.log(`DEBUG: /api/chat - message: "${message}", persona: "${persona}", history length: ${history?.length || 0}`);

    const result = await askElectionAssistant(message, persona, history);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/chat/stream', chatLimiter, validateChatInput, async (req, res, next) => {
  try {
    const { message, persona, history } = req.body;
    console.log(`DEBUG: /api/chat/stream - message: "${message}"`);
    await askElectionAssistantStream(message, persona, history, res);
  } catch (error) {
    next(error);
  }
});

app.post('/api/mythbust', mythLimiter, validateMythInput, async (req, res, next) => {
  try {
    const { message, persona, history } = req.body;
    const mythMessage = `MYTH TO BUST: ${message}. Use the MYTH BUSTING FORMAT from your instructions exactly.`;
    const result = await askElectionAssistant(mythMessage, persona, history);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/mythbust/stream', mythLimiter, validateMythInput, async (req, res, next) => {
  try {
    const { message, persona, history } = req.body;
    const mythMessage = `MYTH TO BUST: ${message}. Use the MYTH BUSTING FORMAT from your instructions exactly.`;
    await askElectionAssistantStream(mythMessage, persona, history, res);
  } catch (error) {
    next(error);
  }
});

// STEP 6: Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    error: "An unexpected error occurred. Please try again.",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;

// Support running directly with node index.js
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.mjs'));
if (isDirectRun) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server started via direct run on port ${port}`);
  });
}

process.on('exit', (code) => {
  console.log(`DEBUG: Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('DEBUG: Uncaught Exception:', err);
});

