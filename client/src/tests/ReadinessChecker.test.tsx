import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReadinessChecker } from '../components/ReadinessChecker';


describe('ReadinessChecker Component', () => {
  const mockOnGetActionPlan = vi.fn();

  it('renders the first question directly', () => {
    render(<ReadinessChecker onGetActionPlan={mockOnGetActionPlan} />);
    expect(screen.getByText(/Do you have your Voter ID card \(EPIC\)\?/i)).toBeInTheDocument();
  });

  it('navigates through questions', () => {
    render(<ReadinessChecker onGetActionPlan={mockOnGetActionPlan} />);
    
    // First question
    expect(screen.getByText(/Do you have your Voter ID card \(EPIC\)\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Yes/i));
    
    // Second question
    expect(screen.getByText(/Is your name listed in the electoral roll\?/i)).toBeInTheDocument();
  });

  it('shows results after last question', () => {
    render(<ReadinessChecker onGetActionPlan={mockOnGetActionPlan} />);
    
    // Answer 5 questions
    fireEvent.click(screen.getByText(/Yes/i)); // q1
    fireEvent.click(screen.getByText(/Yes/i)); // q2
    fireEvent.click(screen.getByText(/Yes/i)); // q3
    fireEvent.click(screen.getByText(/Yes/i)); // q4
    fireEvent.click(screen.getByText(/Yes/i)); // q5
    
    expect(screen.getByText(/Readiness Score: 5\/5/i)).toBeInTheDocument();
    expect(screen.getByText(/You're fully ready to vote!/i)).toBeInTheDocument();
  });
});
