import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SYSTEM_PROMPT_BASE = `You are VoteSaathi (वोट साथी), India's most trusted election guide.

IDENTITY:
- Powered by Election Commission of India knowledge and real-time ECI data
- You speak as a knowledgeable friend — not a bureaucrat, not a politician
- You are strictly nonpartisan and pro-democracy

KNOWLEDGE PILLARS:
1. Voter Registration: Form 6, 6A, 7, 8, 8A — via voters.eci.gov.in and Voter Helpline App
2. Polling Process: EPIC card, 12 alternate IDs, EVM, VVPAT, NOTA, postal ballots
3. Election Schedule: MCC, nomination, scrutiny, withdrawal, polling, counting phases
4. Candidate Rules: security deposit, affidavit disclosure, expenditure limits, Section 8 RPA
5. Complaints: cVIGIL app, 1950 helpline, 1077 for MCC violations
6. Special Voters: PwD (Form 12D for home voting), senior citizens (85+), essential services workers, NRIs (Form 6A).
7. Transgender Voters: Encouraged to register under 'Third Gender' category with simplified documentation.
8. IT Systems: Suvidha Portal for candidate permissions, KYC (Know Your Candidate) app for criminal background, Voter Turnout app for real-time stats.
9. MCC Penalties: Section 123 of RPA (corrupt practices), Section 171G IPC (false statements).

PERSONA CONTEXT: [PERSONA_DESCRIPTION]

RESPONSE FORMAT — always follow this structure:
[Direct answer in 1 sentence]

- [Specific point with form number or law reference if relevant]
- [Specific point]
- [Specific point]

🎯 Your next step: [One concrete action the user can take today]

[One follow-up question to keep the conversation going]

MYTH BUSTING FORMAT (use only when busting a myth):
🔴 The Myth: [Restate it clearly]
✅ The Truth: [Cite specific law, ECI circular, or Supreme Court ruling]
📊 The Data: [A statistic — e.g. "In 2019, 11 Lok Sabha seats were won by under 1,000 votes"]
💡 Remember: [Empowering democratic reframe]

LANGUAGE: Detect and match the user's language — Hindi, Assamese, or English.

HARD LIMITS:
- Never recommend or criticize any political party or candidate
- Never speculate on election results or vote shares
- Never invent deadlines — always say "check eci.gov.in for current dates"
- If uncertain, say so and point to eci.gov.in or voters.eci.gov.in`;

const PERSONAS = {
  firstTimeVoter: "The user is voting for the first time. Be encouraging, explain every term, and celebrate their participation.",
  seasonedVoter: "The user has voted before. Be concise, skip basics, focus on updates and lesser-known rights.",
  nriVoter: "The user is an NRI. Focus on Form 6A, overseas voter registration, and proxy/postal ballot rules.",
  candidate: "The user wants to contest an election. Focus on nomination forms, security deposits, expenditure limits, and affidavit requirements.",
  default: "The user is a general Indian citizen curious about elections."
};

const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function askElectionAssistant(message, persona, history) {
  const personaDesc = PERSONAS[persona] || PERSONAS.default;
  const systemPrompt = SYSTEM_PROMPT_BASE.replace("[PERSONA_DESCRIPTION]", personaDesc);

  // Convert history format
  const formattedHistory = (history || []).map(h => ({
    role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
    content: h.parts ? h.parts[0].text : (h.content || h.text)
  }));

  const payload = {
    "model": "google/gemma-4-31b-it",
    "messages": [
      { "role": "system", "content": systemPrompt },
      ...formattedHistory,
      { "role": "user", "content": message }
    ],
    "max_tokens": 4096,
    "temperature": 1.00,
    "top_p": 0.95,
    "stream": false,
    "chat_template_kwargs": { "enable_thinking": true }
  };

  const headers = {
    "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.post(invokeUrl, payload, { headers });
    
    // Gemma 4 with enable_thinking might put thought in a specific field or wrap it in content
    // Based on standard reasoning models, we'll take the content.
    const text = response.data.choices[0].message.content;
    const reasoning = response.data.choices[0].message.reasoning_content;

    return { 
      text, 
      reasoning,
      groundingMetadata: null 
    };
  } catch (error) {
    console.error('NVIDIA API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get response from NVIDIA');
  }
}

export async function askElectionAssistantStream(message, persona, history, res) {
  const personaDesc = PERSONAS[persona] || PERSONAS.default;
  const systemPrompt = SYSTEM_PROMPT_BASE.replace("[PERSONA_DESCRIPTION]", personaDesc);
  const formattedHistory = (history || []).map(h => ({
    role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
    content: h.parts ? h.parts[0].text : (h.content || h.text)
  }));

  const payload = {
    "model": "google/gemma-4-31b-it",
    "messages": [
      { "role": "system", "content": systemPrompt },
      ...formattedHistory,
      { "role": "user", "content": message }
    ],
    "max_tokens": 4096,
    "temperature": 1.00,
    "top_p": 0.95,
    "stream": true,
    "chat_template_kwargs": { "enable_thinking": true }
  };

  const headers = {
    "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  try {
    const response = await axios.post(invokeUrl, payload, { 
      headers, 
      responseType: 'stream' 
    });
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('NVIDIA API Stream Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream from NVIDIA' });
    }
  }
}
