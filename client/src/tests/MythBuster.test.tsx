import { render, screen, fireEvent } from '@testing-library/react';
import { MythBuster } from '../components/MythBuster';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as UserContext from '../context/UserContext';
import * as useElectionChatHook from '../hooks/useElectionChat';

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));

vi.mock('../hooks/useElectionChat', () => ({
  useElectionChat: vi.fn(),
}));

describe('MythBuster Component', () => {
  const mockBustMyth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (UserContext.useUser as any).mockReturnValue({ persona: 'firstTimeVoter' });
    (useElectionChatHook.useElectionChat as any).mockReturnValue({
      messages: [],
      isLoading: false,
      bustMyth: mockBustMyth,
    });
  });

  it('All 10 pre-loaded myth buttons are rendered', () => {
    render(<MythBuster />);
    // There are 10 myths in the PRELOADED_MYTHS array
    const buttons = screen.getAllByRole('button').filter(b => b.textContent !== 'Bust It 💥');
    expect(buttons).toHaveLength(10);
  });

  it('Clicking a myth button calls bustMyth with the correct myth string', () => {
    render(<MythBuster />);
    const firstMyth = "My single vote doesn't make a difference";
    fireEvent.click(screen.getByText(firstMyth));
    expect(mockBustMyth).toHaveBeenCalledWith(firstMyth);
  });

  it('Typing a custom myth and clicking "Bust It" calls bustMyth with the typed text', () => {
    render(<MythBuster />);
    const input = screen.getByPlaceholderText("Type a myth you've heard...");
    const button = screen.getByText('Bust It 💥');

    fireEvent.change(input, { target: { value: 'Custom Myth' } });
    fireEvent.click(button);

    expect(mockBustMyth).toHaveBeenCalledWith('Custom Myth');
  });

  it('After clicking "Bust It", the input field is cleared', () => {
    render(<MythBuster />);
    const input = screen.getByPlaceholderText("Type a myth you've heard...") as HTMLInputElement;
    const button = screen.getByText('Bust It 💥');

    fireEvent.change(input, { target: { value: 'Custom Myth' } });
    fireEvent.click(button);

    expect(input.value).toBe('');
  });
});
