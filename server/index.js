import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { askElectionAssistant, askElectionAssistantStream } from './nvidia.js';

dotenv.config();

console.log('DEBUG: NVIDIA_API_KEY present:', !!process.env.NVIDIA_API_KEY);
console.log('DEBUG: Current directory:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const VALID_PERSONAS = ['firstTimeVoter', 'seasonedVoter', 'nriVoter', 'candidate', 'default'];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  try {
    let { message, persona, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    if (persona && !VALID_PERSONAS.includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona' });
    }

    // Basic sanitization
    message = message.replace(/<[^>]*>?/gm, '');

    console.log(`DEBUG: /api/chat - message: "${message}", persona: "${persona}", history length: ${history?.length || 0}`);

    const result = await askElectionAssistant(message, persona, history);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to get response from AI' });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  try {
    let { message, persona, history } = req.body;
    if (!message || message.length > 1000) {
      return res.status(400).json({ error: 'Invalid message' });
    }
    if (persona && !VALID_PERSONAS.includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona' });
    }
    message = message.replace(/<[^>]*>?/gm, '');

    console.log(`DEBUG: /api/chat/stream - message: "${message}"`);
    await askElectionAssistantStream(message, persona, history, res);
  } catch (error) {
    console.error('Error in /api/chat/stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to get response from AI' });
    }
  }
});

app.post('/api/mythbust', async (req, res) => {
  try {
    let { message, persona, history } = req.body;
    if (!message || message.length > 1000) {
      return res.status(400).json({ error: 'Invalid message' });
    }
    message = message.replace(/<[^>]*>?/gm, '');

    const mythMessage = `MYTH TO BUST: ${message}. Use the MYTH BUSTING FORMAT from your instructions exactly.`;
    const result = await askElectionAssistant(mythMessage, persona, history);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/mythbust:', error);
    res.status(500).json({ error: 'Failed to bust myth' });
  }
});

app.post('/api/mythbust/stream', async (req, res) => {
  try {
    let { message, persona, history } = req.body;
    if (!message || message.length > 1000) {
      return res.status(400).json({ error: 'Invalid message' });
    }
    message = message.replace(/<[^>]*>?/gm, '');
    const mythMessage = `MYTH TO BUST: ${message}. Use the MYTH BUSTING FORMAT from your instructions exactly.`;
    await askElectionAssistantStream(mythMessage, persona, history, res);
  } catch (error) {
    console.error('Error in /api/mythbust/stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to bust myth' });
    }
  }
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
