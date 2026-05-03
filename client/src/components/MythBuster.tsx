import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useElectionChat } from '../hooks/useElectionChat';
import { useUser } from '../context/UserContext';
import { logEvent, analytics } from '../firebase';

const PRELOADED_MYTHS = [
  "My single vote doesn't make a difference",
  "EVMs can be easily hacked or tampered with",
  "I need my EPIC card to vote — nothing else works",
  "Criminals cannot be stopped from contesting elections in India",
  "NRIs living abroad cannot vote in Indian elections",
  "NOTA is a wasted vote that helps no one",
  "The Election Commission is controlled by the ruling government",
  "Poor and uneducated people should not vote",
  "Paid news and money can always buy elections in India",
  "One party winning means democracy has failed"
];

export const MythBuster: React.FC = React.memo(() => {
  const { persona } = useUser();
  const { messages, isLoading, bustMyth } = useElectionChat(persona || 'default');
  const [customMyth, setCustomMyth] = useState('');

  const handleBust = (myth: string) => {
    logEvent(analytics, 'myth_busted', { myth, type: 'preloaded' });
    bustMyth(myth);
  };

  const handleCustomBust = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMyth.trim()) {
      logEvent(analytics, 'myth_busted', { myth: customMyth, type: 'custom' });
      bustMyth(customMyth);
      setCustomMyth('');
    }
  };

  // Only show the latest myth response
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

  const parseResponse = (text: string) => {
    const sections = {
      myth: '',
      truth: '',
      data: '',
      remember: ''
    };

    const lines = text.split('\n');
    let currentSection: keyof typeof sections | null = null;

    lines.forEach(line => {
      if (line.includes('🔴')) {
        currentSection = 'myth';
        sections.myth += line.replace('🔴', '').trim() + ' ';
      } else if (line.includes('✅')) {
        currentSection = 'truth';
        sections.truth += line.replace('✅', '').trim() + ' ';
      } else if (line.includes('📊')) {
        currentSection = 'data';
        sections.data += line.replace('📊', '').trim() + ' ';
      } else if (line.includes('💡')) {
        currentSection = 'remember';
        sections.remember += line.replace('💡', '').trim() + ' ';
      } else if (currentSection) {
        sections[currentSection] += line.trim() + ' ';
      }
    });

    return sections;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20" role="region" aria-labelledby="mythbuster-title">
      <div className="text-center mb-10">
        <h2 id="mythbuster-title" className="text-4xl font-black text-gray-900 mb-2">🚫 Election Myth Buster</h2>
        <p className="text-lg text-gray-600">Tap a myth — we'll destroy it with facts and data</p>
      </div>

      {/* Pre-loaded Myths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" role="group" aria-label="Common election myths">
        {PRELOADED_MYTHS.map((myth, idx) => (
          <button
            key={idx}
            onClick={() => handleBust(myth)}
            disabled={isLoading}
            aria-label={`Bust myth: ${myth}`}
            className="text-left p-4 rounded-2xl bg-red-50 border border-red-100 text-red-900 font-medium hover:bg-red-100 focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:outline-none transition-all active:scale-95 disabled:opacity-50 min-h-[64px]"
          >
            {myth}
          </button>
        ))}
      </div>

      {/* Custom Myth Input */}
      <section aria-labelledby="custom-myth-heading">
        <h3 id="custom-myth-heading" className="sr-only">Bust a custom myth</h3>
        <form onSubmit={handleCustomBust} className="flex flex-col sm:flex-row gap-2 mb-12 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex-1">
            <label htmlFor="custom-myth-input" className="sr-only">Type a myth you've heard</label>
            <input
              id="custom-myth-input"
              type="text"
              value={customMyth}
              onChange={(e) => setCustomMyth(e.target.value)}
              placeholder="Type a myth you've heard..."
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !customMyth.trim()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:outline-none transition-colors shadow-md active:scale-95 disabled:bg-gray-300 min-h-[44px]"
          >
            Bust It 💥
          </button>
        </form>
      </section>

      {/* Response Card */}
      {/* Loading State */}
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
              role="status"
            >
              <p className="text-gray-600 font-medium italic animate-pulse">
                VoteSaathi is searching live ECI data to bust this myth...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {lastAssistantMessage && !isLoading && (
          <motion.article 
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", damping: 15 }}
            className="perspective-1000"
            aria-labelledby="myth-response-title"
          >
            {(() => {
              const sections = parseResponse(lastAssistantMessage.text);
              return (
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  <h3 id="myth-response-title" className="sr-only">Myth Buster Result</h3>
                  <div className="p-1">
                    {sections.myth && (
                      <div className="m-2 p-6 rounded-2xl bg-red-50 border border-red-100">
                        <h4 className="text-red-800 font-black uppercase tracking-widest text-xs mb-2">🔴 The Myth</h4>
                        <p className="text-red-900 text-lg font-medium">{sections.myth}</p>
                      </div>
                    )}
                    {sections.truth && (
                      <div className="m-2 p-6 rounded-2xl bg-green-50 border border-green-100">
                        <h4 className="text-green-800 font-black uppercase tracking-widest text-xs mb-2">✅ The Truth</h4>
                        <p className="text-green-900 text-lg font-medium">{sections.truth}</p>
                      </div>
                    )}
                    {sections.data && (
                      <div className="m-2 p-6 rounded-2xl bg-blue-50 border border-blue-100">
                        <h4 className="text-blue-800 font-black uppercase tracking-widest text-xs mb-2">📊 Data Point</h4>
                        <p className="text-blue-900">{sections.data}</p>
                      </div>
                    )}
                    {sections.remember && (
                      <div className="m-2 p-6 rounded-2xl bg-orange-50 border border-orange-100">
                        <h4 className="text-orange-800 font-black uppercase tracking-widest text-xs mb-2">💡 Remember</h4>
                        <p className="text-orange-900">{sections.remember}</p>
                      </div>
                    )}
                  </div>

                  {/* Grounding Sources */}
                  {lastAssistantMessage.groundingMetadata?.groundingChunks && (
                    <footer className="p-6 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Live Evidence Sources</p>
                      <nav className="flex flex-wrap gap-2" aria-label="Evidence links">
                        {lastAssistantMessage.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                          chunk.web?.uri && (
                            <a
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:border-orange-500 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none transition-all truncate max-w-[250px]"
                            >
                              {chunk.web.title || 'Official Source'}
                            </a>
                          )
                        ))}
                      </nav>
                    </footer>
                  )}
                </div>
              );
            })()}
          </motion.article>
        )}
      </div>
    </div>
  );
});
