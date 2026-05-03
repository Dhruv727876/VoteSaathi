import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ElectionTimeline } from '../components/ElectionTimeline';


describe('ElectionTimeline Component', () => {
  const mockOnAskAI = vi.fn();

  it('renders correctly with accessibility label', () => {
    render(<ElectionTimeline onAskAI={mockOnAskAI} />);
    expect(screen.getByLabelText(/Indian election schedule/i)).toBeInTheDocument();
  });

  it('displays timeline phases', () => {
    render(<ElectionTimeline onAskAI={mockOnAskAI} />);
    expect(screen.getByText(/Election Announcement/i)).toBeInTheDocument();
    expect(screen.getByText(/Voter Registration/i)).toBeInTheDocument();
    expect(screen.getByText(/Nomination Filing/i)).toBeInTheDocument();
    expect(screen.getByText(/Polling Day/i)).toBeInTheDocument();
    expect(screen.getByText(/Vote Counting/i)).toBeInTheDocument();
  });

  it('shows dates for phases', () => {
    render(<ElectionTimeline onAskAI={mockOnAskAI} />);
    expect(screen.getByText(/March 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/June 4/i)).toBeInTheDocument();
  });
});
