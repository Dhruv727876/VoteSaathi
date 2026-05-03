import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { askElectionAssistant } from '../nvidia.js';

vi.mock('../nvidia.js', () => ({
  askElectionAssistant: vi.fn(),
  askElectionAssistantStream: vi.fn()
}));

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/chat with valid body returns 200 with text and groundingMetadata', async () => {
    askElectionAssistant.mockResolvedValue({
      text: "Test response from VoteSaathi",
      groundingMetadata: null
    });

    const response = await request(app)
      .post('/api/chat')
      .send({
        message: "How do I register to vote?",
        persona: "firstTimeVoter",
        history: []
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      text: "Test response from VoteSaathi",
      groundingMetadata: null
    });
  });

  test('POST /api/chat with missing message field returns 400', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        persona: "firstTimeVoter",
        history: []
      });

    expect(response.status).toBe(400);
  });

  test('POST /api/chat with invalid persona returns 400', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: "Hello",
        persona: "invalidPersona",
        history: []
      });

    expect(response.status).toBe(400);
  });

  test('POST /api/mythbust returns 200 and formatted response', async () => {
    askElectionAssistant.mockResolvedValue({
      text: "🔴 The Myth: EVMs are rigged\n✅ The Truth: EVMs are standalone devices\n📊 The Data: 0 cases found\n💡 Remember: Vote matters",
      groundingMetadata: null
    });

    const response = await request(app)
      .post('/api/mythbust')
      .send({
        message: "EVMs are rigged",
        history: []
      });

    expect(response.status).toBe(200);
    expect(response.body.text).toContain('🔴');
    expect(response.body.text).toContain('✅');
    expect(response.body.text).toContain('📊');
    expect(response.body.text).toContain('💡');
  });
});
