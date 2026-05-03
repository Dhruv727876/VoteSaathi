import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askElectionAssistant, askElectionAssistantStream } from '../nvidia.js';
import axios from 'axios';

vi.mock('axios');

describe('NVIDIA AI Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('askElectionAssistant', () => {
    it('successfully calls NVIDIA and returns response', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Test content',
                reasoning_content: 'Test thought'
              },
            },
          ],
        }
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await askElectionAssistant('Hello', 'default', []);
      expect(result).toEqual({
        text: 'Test content',
        reasoning: 'Test thought',
        groundingMetadata: null,
      });
      expect(axios.post).toHaveBeenCalled();
    });

    it('handles API errors', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('API Error'));
      await expect(askElectionAssistant('Hello')).rejects.toThrow('Failed to get response from NVIDIA');
    });
  });

  describe('askElectionAssistantStream', () => {
    it('successfully initiates stream', async () => {
      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false
      };

      const mockPipe = vi.fn();
      const mockAxiosResponse = {
        data: {
          pipe: mockPipe
        }
      };

      vi.mocked(axios.post).mockResolvedValue(mockAxiosResponse);

      await askElectionAssistantStream('Hello', 'default', [], mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockPipe).toHaveBeenCalledWith(mockRes);
    });

    it('handles stream initiation errors', async () => {
      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false
      };

      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      await askElectionAssistantStream('Hello', 'default', [], mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to stream from NVIDIA' });
    });
  });
});
