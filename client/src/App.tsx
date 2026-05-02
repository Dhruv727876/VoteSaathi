import { useState, useRef, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import type { ChatInterfaceHandle } from './components/ChatInterface';
import { PersonaSelector } from './components/PersonaSelector';
import { ElectionTimeline } from './components/ElectionTimeline';
import { MythBuster } from './components/MythBuster';
import { ReadinessChecker } from './components/ReadinessChecker';
import { useUser } from './context/UserContext';

// Ashoka Chakra SVG Component
const AshokaChakra = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-900 animate-[spin_20s_linear_infinite]">
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

function App() {
  const { persona, setPersona } = useUser();
  const [activeTab, setActiveTab] = useState<'guide' | 'mythbuster' | 'readiness'>('guide');
  const chatRef = useRef<ChatInterfaceHandle>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoTriggered, setDemoTriggered] = useState(false);

  // Reset scroll to top on tab or persona change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, persona]);

  // Check for demo mode in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      setIsDemoMode(true);
      if (!persona) {
        setPersona('firstTimeVoter');
      }
    }
  }, [persona, setPersona]);

  // Demo auto-start logic
  useEffect(() => {
    if (isDemoMode && persona === 'firstTimeVoter' && activeTab === 'guide' && !demoTriggered) {
      const timer = setTimeout(() => {
        setDemoTriggered(true);
        handleAskAI("How do I register to vote for the first time in Assam?");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isDemoMode, persona, activeTab, demoTriggered]);

  if (!persona) {
    return <PersonaSelector />;
  }

  const handleAskAI = (question: string) => {
    setActiveTab('guide');
    setTimeout(() => {
      chatRef.current?.sendMessage(question);
      const chatElement = document.getElementById('ai-chat-section');
      chatElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGetActionPlan = (gaps: string[]) => {
    const question = `I just took the Readiness Quiz and identified these gaps in my preparation: ${gaps.join(', ')}. Can you help me fix these and create a step-by-step action plan?`;
    handleAskAI(question);
  };

  const getPersonaLabel = () => {
    switch (persona) {
      case 'firstTimeVoter': return '🗳️ First-time Voter';
      case 'seasonedVoter': return '✅ Returning Voter';
      case 'nriVoter': return '✈️ NRI / Overseas';
      case 'candidate': return '📋 Aspiring Candidate';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AshokaChakra />
            <span className="text-2xl font-black text-orange-600 tracking-tighter">VoteSaathi</span>
            <span className="text-2xl ml-[-4px]">🇮🇳</span>
          </div>
          <div className="flex items-center gap-3">
            {isDemoMode && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                DEMO MODE
              </div>
            )}
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
              {getPersonaLabel()}
            </div>
            <button 
              onClick={() => setPersona(null)}
              className="text-gray-400 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              Change
            </button>
          </div>
        </div>
        {/* Tricolor Gradient Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {/* Tabs */}
        <div className="flex flex-wrap bg-white p-1 rounded-2xl shadow-sm mb-8 w-full md:w-fit border border-gray-100">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all min-h-[44px] ${
              activeTab === 'guide' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Guide
          </button>
          <button
            onClick={() => setActiveTab('mythbuster')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all min-h-[44px] ${
              activeTab === 'mythbuster' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Myth Buster
          </button>
          <button
            onClick={() => setActiveTab('readiness')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all min-h-[44px] ${
              activeTab === 'readiness' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Readiness Quiz
          </button>
        </div>

        {activeTab === 'guide' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] mb-6 rounded-full opacity-50" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Interactive Election Journey</h2>
            <ElectionTimeline onAskAI={handleAskAI} />
            
            <div className="mt-12" id="ai-chat-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Ask VoteSaathi AI</h2>
              <div className="flex justify-center">
                <ChatInterface ref={chatRef} />
              </div>
            </div>
          </div>
        ) : activeTab === 'mythbuster' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <MythBuster />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Are you ready to vote?</h2>
            <p className="text-gray-500 text-center mb-10">Take this 1-minute quiz to find out and get a personalized plan.</p>
            <ReadinessChecker onGetActionPlan={handleGetActionPlan} />
          </div>
        )}
      </main>

      {/* Floating Help Button */}
      <button
        onClick={() => handleAskAI("I need some help getting started. What should I do first to prepare for the elections?")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-orange-700 hover:scale-110 transition-all z-50 group"
        title="Ask for help"
      >
        <span>?</span>
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Need help? Ask VoteSaathi
        </span>
      </button>

      <footer className="py-12 text-gray-500 text-sm text-center border-t border-orange-100 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="font-bold text-gray-900 mb-2">VoteSaathi 🇮🇳</p>
          <p>Powered by Google Gemma 4 31B IT</p>
          <p className="mt-1">Data sourced from eci.gov.in · Built for Hack2Skill VirtualPromptWars</p>
          <p className="mt-4 italic text-xs">A smarter democracy starts with an informed voter.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
