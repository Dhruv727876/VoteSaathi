import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { askElectionAssistant } from '../nvidia.js';

vi.mock('../nvidia.js', () => ({
  askElectionAssistant: vi.fn(),
  askElectionAssistantStream: vi.fn()
}));

describe('Security and Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/chat with message > 1000 chars returns 400', async () => {
    const longMessage = 'a'.repeat(1001);
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: longMessage,
        persona: "firstTimeVoter",
        history: []
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Message must be between 1 and 1000 characters');
  });

  test('POST /api/chat sanitizes HTML tags', async () => {
    askElectionAssistant.mockResolvedValue({ text: "Clean", groundingMetadata: null });
    
    await request(app)
      .post('/api/chat')
      .send({
        message: "<script>alert('xss')</script>How do I vote?",
        persona: "firstTimeVoter",
        history: []
      });

    // Verify the mock was called with sanitized message (tags escaped by xss package)
    expect(askElectionAssistant).toHaveBeenCalledWith(
      "&lt;script&gt;alert('xss')&lt;/script&gt;How do I vote?",
      "firstTimeVoter",
      expect.anything()
    );
  });

  test('POST /api/chat with malicious persona returns 400', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: "Hello",
        persona: "hacker'; DROP TABLE users;--",
        history: []
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid persona');
  });
});
