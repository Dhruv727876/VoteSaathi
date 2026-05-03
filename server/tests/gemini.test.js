import { describe, test, expect } from 'vitest';
import { buildSystemPrompt } from '../gemini.js';

describe('Gemini System Prompt Builder', () => {
  test('buildSystemPrompt("firstTimeVoter") contains "first time"', () => {
    const prompt = buildSystemPrompt('firstTimeVoter');
    expect(prompt.toLowerCase()).toMatch(/first[ -]time/);
  });

  test('buildSystemPrompt("nriVoter") contains "NRI" or "overseas"', () => {
    const prompt = buildSystemPrompt('nriVoter');
    const lower = prompt.toLowerCase();
    expect(lower.includes('nri') || lower.includes('overseas')).toBe(true);
  });

  test('buildSystemPrompt("candidate") contains "nomination" or "contest"', () => {
    const prompt = buildSystemPrompt('candidate');
    const lower = prompt.toLowerCase();
    expect(lower.includes('nomination') || lower.includes('contest')).toBe(true);
  });

  test('buildSystemPrompt("seasonedVoter") contains "concise" or "updates"', () => {
    const prompt = buildSystemPrompt('seasonedVoter');
    const lower = prompt.toLowerCase();
    expect(lower.includes('concise') || lower.includes('updates')).toBe(true);
  });

  test('buildSystemPrompt("unknownPersona") returns fallback default text', () => {
    const prompt = buildSystemPrompt('unknownPersona');
    expect(prompt).toContain('curious about elections');
  });

  test('Every persona prompt contains "eci.gov.in"', () => {
    const personas = ['firstTimeVoter', 'seasonedVoter', 'nriVoter', 'candidate'];
    personas.forEach(p => {
      const prompt = buildSystemPrompt(p);
      expect(prompt).toContain('eci.gov.in');
    });
  });

  test('No persona prompt contains prohibited content', () => {
    const personas = ['firstTimeVoter', 'seasonedVoter', 'nriVoter', 'candidate'];
    personas.forEach(p => {
      const prompt = buildSystemPrompt(p);
      const lower = prompt.toLowerCase();
      expect(lower).not.toContain('party recommendation');
      expect(lower).not.toContain('candidate recommendation');
    });
  });
});
