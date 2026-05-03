import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ElectionTimeline } from '../components/ElectionTimeline';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ElectionTimeline Component', () => {
  it('renders correctly', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/General Elections 2024 Timeline/i)).toBeInTheDocument();
  });

  it('displays timeline phases', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/Nomination Phase/i)).toBeInTheDocument();
    expect(screen.getByText(/Scrutiny Phase/i)).toBeInTheDocument();
    expect(screen.getByText(/Polling Phase/i)).toBeInTheDocument();
    expect(screen.getByText(/Result Day/i)).toBeInTheDocument();
  });

  it('shows dates for phases', () => {
    render(<ElectionTimeline />);
    expect(screen.getByText(/March - April 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/June 4, 2024/i)).toBeInTheDocument();
  });
});
