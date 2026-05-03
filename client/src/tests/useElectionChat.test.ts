import { renderHook, act } from '@testing-library/react';
import { useElectionChat } from '../hooks/useElectionChat';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubGlobal('fetch', vi.fn());

describe('useElectionChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Initial state — messages is an empty array, isLoading is false', () => {
    const { result } = renderHook(() => useElectionChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('After sendMessage is called, isLoading becomes true during fetch', async () => {
    let resolveFetch: any;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (fetch as any).mockReturnValue(fetchPromise);

    const { result } = renderHook(() => useElectionChat());
    
    act(() => {
      result.current.sendMessage('Hello');
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      resolveFetch({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn().mockResolvedValue({ done: true, value: new Uint8Array() })
          })
        }
      });
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('After sendMessage resolves, the messages array contains user and assistant entries', async () => {
    // Mock for streaming response is complex, let's mock the internal fetch
    (fetch as any).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => {
          let called = false;
          return {
            read: () => {
              if (called) return Promise.resolve({ done: true });
              called = true;
              return Promise.resolve({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\ndata: [DONE]\n')
              });
            }
          };
        }
      }
    });

    const { result } = renderHook(() => useElectionChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('The fetch call includes the correct body', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read: () => Promise.resolve({ done: true }) }) }
    });

    const { result } = renderHook(() => useElectionChat('candidate'));
    
    await act(async () => {
      await result.current.sendMessage('How do I run?');
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/stream'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"message":"How do I run?"'),
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/stream'),
      expect.objectContaining({
        body: expect.stringContaining('"persona":"candidate"'),
      })
    );
  });

  it('If fetch throws a network error, isLoading returns to false', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useElectionChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages.some(m => m.text.includes('Network error'))).toBe(true);
  });

  it('bustMyth calls /api/mythbust', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read: () => Promise.resolve({ done: true }) }) }
    });

    const { result } = renderHook(() => useElectionChat());
    
    await act(async () => {
      await result.current.bustMyth('EVM is bad');
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mythbust/stream'),
      expect.anything()
    );
  });
});
