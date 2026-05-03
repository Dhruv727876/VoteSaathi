import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics, logEvent } from "../firebase";

interface TimelineStage {
  id: string;
  label: string;
  icon: string;
  summary: string;
  details: string;
  userAction: string;
  askAI: string;
}

const timelineData: TimelineStage[] = [
  {
    id: "announcement",
    label: "Election Announcement",
    icon: "📢",
    summary: "ECI announces schedule, MCC activates immediately",
    details: "The Model Code of Conduct comes into force the moment the schedule is announced. No new government schemes, transfers of officials, or use of government machinery for campaigning is allowed after this point.",
    userAction: "Bookmark eci.gov.in and your state's Chief Electoral Officer website",
    askAI: "What is the Model Code of Conduct and what changes the moment it is announced?"
  },
  {
    id: "registration",
    label: "Voter Registration",
    icon: "📝",
    summary: "Last date to register or update voter details",
    details: "File Form 6 for new registration, Form 8 for corrections to existing entry, Form 7 for deletion, Form 6A if you are an overseas voter. All forms available at voters.eci.gov.in or the Voter Helpline App.",
    userAction: "Check your name right now at voters.eci.gov.in/search-in-electoral-roll",
    askAI: "How do I check if my name is on the electoral roll and what do I do if it is missing?"
  },
  {
    id: "nomination",
    label: "Nomination Filing",
    icon: "📋",
    summary: "Candidates file nomination papers with Returning Officer",
    details: "Candidates file Form 2B. Security deposit is ₹25,000 for Lok Sabha and ₹10,000 for state assembly elections (half for SC/ST candidates). A mandatory affidavit disclosing assets, liabilities, and criminal record must be filed.",
    userAction: "If contesting, check Form 26 (affidavit) requirements at eci.gov.in",
    askAI: "What documents and deposit does a candidate need to file nomination for a Lok Sabha election?"
  },
  {
    id: "campaigning",
    label: "Campaign Period",
    icon: "📣",
    summary: "Parties campaign — MCC strictly enforced",
    details: "Campaigning must stop 48 hours before polling begins (the Silent Period). No exit polls can be published until the last phase of polling ends. Use cVIGIL app to report MCC violations.",
    userAction: "Research candidates at myneta.info — see their declared assets and cases",
    askAI: "What are the rules candidates must follow during the campaign period under the Model Code of Conduct?"
  },
  {
    id: "polling",
    label: "Polling Day",
    icon: "🗳️",
    summary: "Exercise your vote — bring EPIC or any of 12 alternate IDs",
    details: "Polling stations open 7am to 6pm. You can vote with your EPIC card or any one of 12 approved alternate photo identity documents including Aadhaar, passport, driving licence, PAN card, and bank passbook with photo. NOTA is available as the last option on the EVM.",
    userAction: "Find your exact polling booth at voters.eci.gov.in/booth-locator before polling day",
    askAI: "What ID documents are accepted for voting in India if I don't have my EPIC card?"
  },
  {
    id: "counting",
    label: "Vote Counting",
    icon: "🔢",
    summary: "EVMs opened, VVPAT slips verified, results declared",
    details: "Counting happens at designated centres under the supervision of Returning Officers. A mandatory VVPAT slip verification of 5 randomly selected EVMs per assembly segment adds a paper audit trail. Results are declared constituency by constituency.",
    userAction: "Follow live results at results.eci.gov.in on counting day",
    askAI: "How does EVM and VVPAT counting work and what safeguards prevent tampering?"
  }
];

interface ElectionTimelineProps {
  onAskAI: (question: string) => void;
}

export const ElectionTimeline: React.FC<ElectionTimelineProps> = ({ onAskAI }) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scroll to active stage
  useEffect(() => {
    if (activeStage && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-stage-id="${activeStage}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStage]);

  const activeData = timelineData.find(s => s.id === activeStage);

  return (
    <div className="w-full mb-10 relative group">
      {/* Scroll indicator fade - only show when there is scrollable content */}
      <AnimatePresence>
        {showRightScroll && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-orange-50 via-orange-50/80 to-transparent pointer-events-none z-10 rounded-r-3xl" 
          />
        )}
        {showLeftScroll && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-orange-50 via-orange-50/80 to-transparent pointer-events-none z-10 rounded-l-3xl" 
          />
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {showLeftScroll && (
        <div className="absolute left-[-20px] top-[60px] md:top-[70px] z-20">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center border border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white transition-all active:scale-95 animate-in fade-in zoom-in-95"
            title="Scroll Left"
          >
            <span className="text-xl font-bold">←</span>
          </button>
        </div>
      )}
      {showRightScroll && (
        <div className="absolute right-[-20px] top-[60px] md:top-[70px] z-20">
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center border border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white transition-all active:scale-95 animate-in fade-in zoom-in-95"
            title="Scroll Right"
          >
            <span className="text-xl font-bold">→</span>
          </button>
        </div>
      )}
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto pb-4 pt-2 gap-4 custom-scrollbar items-center px-8 scroll-smooth"
      >
        {timelineData.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <motion.button
              data-stage-id={stage.id}
              onClick={() => {
                const isExpanding = activeStage !== stage.id;
                setActiveStage(isExpanding ? stage.id : null);
                if (isExpanding) {
                  logEvent(analytics, "timeline_stage_viewed", { stage_id: stage.id });
                }
              }}
              animate={activeStage === stage.id ? { scale: [1, 1.05, 1], borderColor: ["#f97316", "#fb923c", "#f97316"] } : {}}
              transition={activeStage === stage.id ? { repeat: Infinity, duration: 2 } : {}}
              className={`flex-shrink-0 flex flex-col items-center p-4 md:p-5 rounded-2xl transition-all duration-300 border-2 w-[150px] md:w-[180px] min-h-[140px] md:min-h-[160px] ${
                activeStage === stage.id 
                  ? 'border-orange-500 bg-orange-50 shadow-lg' 
                  : 'border-transparent bg-white hover:border-orange-200 shadow-sm hover:shadow-md'
              }`}
            >
              <span className="text-2xl md:text-3xl mb-2">{stage.icon}</span>
              <span className="text-xs md:text-sm font-semibold text-center text-gray-800 leading-tight min-h-[40px] flex items-center justify-center">{stage.label}</span>
            </motion.button>
            {idx < timelineData.length - 1 && (
              <span className="text-gray-300 text-xl flex-shrink-0">→</span>
            )}
          </React.Fragment>
        ))}
        {/* Spacer to ensure the last card isn't cut off by container padding */}
        <div className="w-8 flex-shrink-0" />
      </div>


      {activeData && (
        <div className="mt-4 bg-white rounded-3xl p-6 shadow-lg border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>{activeData.icon}</span> {activeData.label}
              </h3>
              <p className="text-orange-600 font-medium mt-1">{activeData.summary}</p>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            {activeData.details}
          </p>

          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-6">
            <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-1">🎯 Your next step</h4>
            <p className="text-orange-900">{activeData.userAction}</p>
          </div>

          <button
            onClick={() => {
              onAskAI(activeData.askAI);
              logEvent(analytics, "timeline_ask_ai_clicked", { 
                stage_id: activeData.id, 
                question: activeData.askAI 
              });
            }}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            Ask AI about this →
          </button>
        </div>
      )}
    </div>
  );
};
