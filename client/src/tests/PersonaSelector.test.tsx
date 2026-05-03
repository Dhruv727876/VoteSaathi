import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaSelector } from '../components/PersonaSelector';
import { describe, it, expect, vi } from 'vitest';
import * as UserContext from '../context/UserContext';

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));


describe('PersonaSelector Component', () => {
  it('Renders all 4 persona cards', () => {
    (UserContext.useUser as any).mockReturnValue({ setPersona: vi.fn() });
    render(<PersonaSelector />);
    
    expect(screen.getByText('First-time Voter')).toBeInTheDocument();
    expect(screen.getByText('Returning Voter')).toBeInTheDocument();
    expect(screen.getByText('NRI / Overseas')).toBeInTheDocument();
    expect(screen.getByText('Aspiring Candidate')).toBeInTheDocument();
  });

  it('Clicking "First-time Voter" card calls setPersona with "firstTimeVoter"', () => {
    const setPersona = vi.fn();
    (UserContext.useUser as any).mockReturnValue({ setPersona });
    render(<PersonaSelector />);
    
    fireEvent.click(screen.getByText('First-time Voter'));
    expect(setPersona).toHaveBeenCalledWith('firstTimeVoter');
  });

  it('Clicking "NRI / Overseas" card calls setPersona with "nriVoter"', () => {
    const setPersona = vi.fn();
    (UserContext.useUser as any).mockReturnValue({ setPersona });
    render(<PersonaSelector />);
    
    fireEvent.click(screen.getByText('NRI / Overseas'));
    expect(setPersona).toHaveBeenCalledWith('nriVoter');
  });

  it('All 4 cards are visible in the document', () => {
    (UserContext.useUser as any).mockReturnValue({ setPersona: vi.fn() });
    render(<PersonaSelector />);
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });
});
