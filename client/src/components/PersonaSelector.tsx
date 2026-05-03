import React from 'react';
import { useUser } from '../context/UserContext';
import { analytics, logEvent } from "../firebase";

const personas = [
  {
    id: 'firstTimeVoter',
    emoji: '🗳️',
    label: 'First-time Voter',
    subtitle: 'Never voted before',
  },
  {
    id: 'seasonedVoter',
    emoji: '✅',
    label: 'Returning Voter',
    subtitle: 'Voted before, want updates',
  },
  {
    id: 'nriVoter',
    emoji: '✈️',
    label: 'NRI / Overseas',
    subtitle: 'Voting from abroad',
  },
  {
    id: 'candidate',
    emoji: '📋',
    label: 'Aspiring Candidate',
    subtitle: 'Want to contest elections',
  },
];

const AshokaChakra = () => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="text-blue-900 animate-[spin_30s_linear_infinite] mx-auto mb-6"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    {[...Array(24)].map((_, i) => (
      <line
        key={i}
        x1="12"
        y1="12"
        x2={12 + 10 * Math.cos((i * 15 * Math.PI) / 180)}
        y2={12 + 10 * Math.sin((i * 15 * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="0.5"
      />
    ))}
  </svg>
);

export const PersonaSelector: React.FC = React.memo(() => {
  const { setPersona } = useUser();

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="persona-selector-title"
      className="fixed inset-0 bg-orange-50 flex items-center justify-center p-6 z-50 overflow-y-auto"
    >
      <div className="max-w-4xl w-full text-center py-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <AshokaChakra />
          <div className="text-2xl font-black text-orange-600 tracking-tighter" aria-hidden="true">VoteSaathi</div>
        </div>
        <h1 id="persona-selector-title" className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Who are you in this election? 🇮🇳
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Help us personalize your experience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
          {personas.map((p) => (
            <button
              key={p.id}
              role="listitem"
              aria-label={`Select ${p.label}: ${p.subtitle}`}
              onClick={() => {
                setPersona(p.id as any);
                logEvent(analytics, "persona_selected", { persona_id: p.id });
              }}
              className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-500 hover:bg-orange-50 focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:outline-none transition-all duration-300 text-left group flex flex-col items-center md:items-start min-h-[180px]"
            >
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                {p.emoji}
              </span>
              <span className="text-2xl font-bold text-gray-900 mb-1">
                {p.label}
              </span>
              <span className="text-gray-600 font-medium">
                {p.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
