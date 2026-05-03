import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInterface } from '../components/ChatInterface';
import * as UserContext from '../context/UserContext';

// Mock useUser
vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));

// Mock the hook
vi.mock('../hooks/useElectionChat', () => ({
  useElectionChat: () => ({
    messages: [
      { role: 'assistant', text: 'Hello! I am VoteSaathi.' }
    ],
    isLoading: false,
    sendMessage: vi.fn(),
  }),
}));

describe('ChatInterface Component', () => {
  beforeEach(() => {
    (UserContext.useUser as any).mockReturnValue({ persona: 'firstTimeVoter' });
  });

  it('renders correctly with initial message', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Hello! I am VoteSaathi./i)).toBeInTheDocument();
  });

  it('shows input field and send button', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/Type your question.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Type your question.../i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'How to vote?' } });
    expect(input.value).toBe('How to vote?');
  });

  it('shows suggested questions', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Suggested Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/How do I register to vote\?/i)).toBeInTheDocument();
  });
});
