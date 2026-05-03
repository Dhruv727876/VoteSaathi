import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useElectionChat } from '../hooks/useElectionChat';
import { useUser } from '../context/UserContext';
import { logEvent, analytics } from '../firebase';

export interface ChatInterfaceHandle {
  sendMessage: (text: string) => void;
}

const SUGGESTIONS = {
  firstTimeVoter: ["How do I register to vote?", "What ID do I need on polling day?", "What is NOTA?"],
  seasonedVoter: ["What changed in 2024 election rules?", "How do I update my address on voter roll?", "What is the VHP threshold for deposit refund?"],
  nriVoter: ["How do I register as an overseas voter?", "Can I vote by proxy?", "What is Form 6A?"],
  candidate: ["What is the expenditure limit for Lok Sabha?", "What must the affidavit disclose?", "When does the nomination window open?"]
};

export const ChatInterface = forwardRef<ChatInterfaceHandle>((_, ref) => {
  const { persona } = useUser();
  const { messages, isLoading, sendMessage } = useElectionChat(persona || 'default');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [assistantCount, setAssistantCount] = useState(0);

  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      sendMessage(text);
    }
  }));

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Count assistant messages to show grounding note
    const count = messages.filter(m => m.role === 'assistant').length;
    setAssistantCount(count);
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      logEvent(analytics, 'chat_message_sent', { persona });
      sendMessage(input);
      setInput('');
    }
  };

  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (persona && SUGGESTIONS[persona as keyof typeof SUGGESTIONS]) {
      const all = SUGGESTIONS[persona as keyof typeof SUGGESTIONS];
      // Pick 3 random or first 3
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      setCurrentSuggestions(shuffled.slice(0, 3));
    }
  }, [persona, messages.length]); // Refresh on persona change or after a message exchange

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [showRightSug, setShowRightSug] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (suggestionsRef.current) {
        setShowRightSug(suggestionsRef.current.scrollWidth > suggestionsRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [currentSuggestions]);

  return (
    <div className="flex flex-col h-[500px] md:h-[650px] max-h-[80vh] w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
      {/* Chat Messages */}
      <div 
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Election assistant conversation"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-10"
            >
              <div className="text-4xl mb-4" role="img" aria-label="India flag">🇮🇳</div>
              <p className="text-lg font-medium text-gray-700">Namaste! How can I help you today?</p>
              <p className="text-sm text-gray-400 mt-1">Ask about voter ID, forms, or schedules.</p>
            </motion.div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                aria-label={msg.role === 'user' ? `You said: ${msg.text}` : `VoteSaathi replied: ${msg.text}`}
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && msg.reasoning && (
                  <details className="mb-3 group">
                    <summary className="text-[10px] uppercase tracking-widest font-bold text-gray-400 cursor-pointer list-none flex items-center gap-1 group-open:mb-2 hover:text-orange-500 transition-colors">
                      <span className="group-open:rotate-90 transition-transform">▶</span> Thinking Process
                    </summary>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 italic leading-relaxed whitespace-pre-wrap">
                      {msg.reasoning}
                    </div>
                  </details>
                )}
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.text}</div>
                
                {/* Grounding Sources */}
                {msg.role === 'assistant' && msg.groundingMetadata?.groundingChunks && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
                    <p className="font-bold uppercase tracking-wider mb-2 text-gray-400">Live Evidence Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingMetadata.groundingChunks.map((chunk: any, cIdx: number) => (
                        chunk.web?.uri && (
                          <a 
                            key={cIdx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:border-orange-300 hover:text-orange-600 transition-all truncate max-w-[180px] underline"
                          >
                            {chunk.web.title || 'Official Source'}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-center"
              role="status"
              aria-live="polite"
              aria-label="VoteSaathi is thinking"
            >
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-4 bg-orange-200 rounded-full animate-ping absolute"></div>
                  <div className="w-4 h-4 bg-orange-600 rounded-full relative"></div>
                </div>
                <p className="text-xs italic text-gray-500 font-medium animate-pulse">VoteSaathi is thinking...</p>
              </div>
            </motion.div>
          )}

          {assistantCount > 0 && assistantCount % 3 === 0 && !isLoading && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[10px] text-gray-400 py-2"
            >
              📎 This answer used live Google Search data from ECI and news sources
            </motion.p>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {!isLoading && currentSuggestions.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggested Questions</span>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>
          <div className="relative">
            {showRightSug && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            )}
            <div 
              ref={suggestionsRef}
              className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 scroll-smooth"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setShowRightSug(target.scrollLeft < target.scrollWidth - target.clientWidth - 10);
              }}
            >
              {currentSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    logEvent(analytics, 'chat_message_sent', { persona, source: 'suggestion' });
                    sendMessage(suggestion);
                  }}
                  aria-label={`Ask: ${suggestion}`}
                  className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm active:scale-95 min-h-[32px] h-11"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            aria-label="Type your election question"
            aria-describedby="chat-hint"
            className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-semibold hover:bg-orange-700 disabled:bg-gray-200 transition-all shadow-lg active:scale-90 py-3 px-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        <div id="chat-hint" className="sr-only">
          Press Enter or click Send to ask VoteSaathi
        </div>
      </div>
    </div>
  );
});
