import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInterface } from '../components/ChatInterface';

// Mock the hook
vi.mock('../hooks/useElectionChat', () => ({
  default: () => ({
    messages: [
      { role: 'assistant', content: 'Hello! I am VoteSaathi.' }
    ],
    isLoading: false,
    sendMessage: vi.fn(),
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ChatInterface Component', () => {
  it('renders correctly with initial message', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Hello! I am VoteSaathi./i)).toBeInTheDocument();
  });

  it('shows input field and send button', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/Ask anything about elections.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Ask anything about elections.../i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'How to vote?' } });
    expect(input.value).toBe('How to vote?');
  });

  it('shows suggested questions', () => {
    render(<ChatInterface />);
    expect(screen.getByText(/Suggested Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/How do I register?/i)).toBeInTheDocument();
  });
});
