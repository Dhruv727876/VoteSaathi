import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReadinessChecker } from '../components/ReadinessChecker';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ReadinessChecker Component', () => {
  it('renders correctly with welcome screen', () => {
    render(<ReadinessChecker />);
    expect(screen.getByText(/Voter Readiness Checker/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Check/i)).toBeInTheDocument();
  });

  it('starts the quiz when clicking "Start Check"', () => {
    render(<ReadinessChecker />);
    const startButton = screen.getByText(/Start Check/i);
    fireEvent.click(startButton);
    
    // Check if first question appears
    expect(screen.getByText(/1. Is your name in the Official Voter List/i)).toBeInTheDocument();
  });

  it('navigates through questions', () => {
    render(<ReadinessChecker />);
    fireEvent.click(screen.getByText(/Start Check/i));
    
    // Click "Yes" for first question
    fireEvent.click(screen.getByText(/Yes/i));
    
    // Should move to next question
    expect(screen.getByText(/2. Do you have a valid Voter ID/i)).toBeInTheDocument();
  });
});
