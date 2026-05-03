import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent, analytics } from '../firebase';
import { useUserProgress } from '../hooks/useUserProgress';

interface ReadinessCheckerProps {
  onGetActionPlan: (gaps: string[]) => void;
}

const QUESTIONS = [
  {
    id: 'voterId',
    text: "Do you have your Voter ID card (EPIC)?",
    icon: "🪪",
    gap: "I don't have my Voter ID card yet."
  },
  {
    id: 'electoralRoll',
    text: "Is your name listed in the electoral roll?",
    icon: "📋",
    gap: "I'm not sure if my name is in the electoral roll."
  },
  {
    id: 'pollingStation',
    text: "Do you know your designated polling station?",
    icon: "📍",
    gap: "I don't know where my polling station is."
  },
  {
    id: 'alternativeId',
    text: "Do you have an alternative ID (Aadhaar, Passport, etc.)?",
    icon: "📑",
    gap: "I need to know what alternative IDs are valid for voting."
  },
  {
    id: 'electionDate',
    text: "Are you aware of the polling date for your area?",
    icon: "📅",
    gap: "I don't know the election date for my constituency."
  }
];

export const ReadinessChecker: React.FC<ReadinessCheckerProps> = ({ onGetActionPlan }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const { saveProgress } = useUserProgress();

  const handleAnswer = (answer: boolean) => {
    const currentQuestion = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // For the final step, calculate score including the last answer
      const finalAnswers = { ...answers, [currentQuestion.id]: answer };
      const score = Object.values(finalAnswers).filter(val => val).length;
      const gaps = QUESTIONS.filter(q => !finalAnswers[q.id]).map(q => q.gap);
      
      logEvent(analytics, 'readiness_check_completed', { score });
      saveProgress(score, gaps);
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).filter(val => val).length;
  };

  const getGaps = () => {
    return QUESTIONS
      .filter(q => !answers[q.id])
      .map(q => q.gap);
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setIsFinished(false);
  };

  if (isFinished) {
    const score = calculateScore();
    const gaps = getGaps();

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100 max-w-2xl mx-auto"
        role="status"
        aria-live="assertive"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4" aria-hidden="true">
            {score === 5 ? "🎖️" : score >= 3 ? "👍" : "⚠️"}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Readiness Score: {score}/5
          </h3>
          <p className="text-gray-600 mt-2">
            {score === 5 
              ? "You're fully ready to vote! Great job." 
              : "You're getting there, but there are a few things to check."}
          </p>
        </div>

        {gaps.length > 0 && (
          <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-100" role="region" aria-labelledby="action-plan-title">
            <h4 id="action-plan-title" className="font-bold text-orange-800 mb-4 flex items-center gap-2">
              <span aria-hidden="true">🚀</span> Your Personalized Action Plan
            </h4>
            <ul className="space-y-3">
              {gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-3 text-orange-900 text-sm">
                  <span className="text-orange-400 font-bold" aria-hidden="true">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              logEvent(analytics, 'readiness_shared', { score });
              const summary = `🗳️ VoteSaathi Readiness Check\nScore: ${score}/5\n${gaps.length > 0 ? 'My Action Plan:\n' + gaps.map(g => `- ${g}`).join('\n') : 'I am 100% ready to vote!'}\n\nCheck your readiness at VoteSaathi!`;
              navigator.clipboard.writeText(summary);
              alert("Readiness summary copied to clipboard! 📋");
            }}
            aria-label="Copy results to clipboard to share"
            className="flex-1 bg-white text-orange-600 border-2 border-orange-600 font-bold py-4 rounded-2xl hover:bg-orange-50 focus-visible:ring-4 focus-visible:ring-orange-500 transition-all shadow-lg active:scale-95 min-h-[44px]"
          >
            Share Results 🔗
          </button>
          {gaps.length > 0 && (
            <button
              onClick={() => onGetActionPlan(gaps)}
              aria-label="Use AI assistant to help fix these gaps"
              className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 focus-visible:ring-4 focus-visible:ring-orange-500 transition-all shadow-lg shadow-orange-200 min-h-[44px]"
            >
              Fix Gaps with AI 🤖
            </button>
          )}
          <button
            onClick={resetQuiz}
            aria-label="Retake the readiness check"
            className="flex-1 font-bold py-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-gray-500 transition-all min-h-[44px]"
          >
            Retake
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="max-w-2xl mx-auto" role="region" aria-labelledby="readiness-title">
      <h2 id="readiness-title" className="sr-only">Election Readiness Check</h2>
      
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">
            Step {step + 1} of 5
          </span>
          <span className="sr-only" aria-live="polite">
            Current progress: {((step + 1) / 5) * 100}%
          </span>
        </div>
        <div 
          className="flex gap-1" 
          role="progressbar" 
          aria-valuemin={0} 
          aria-valuemax={5} 
          aria-valuenow={step + 1}
          aria-valuetext={`Step ${step + 1} of 5`}
        >
          {QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-orange-600' : 'bg-orange-100'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-orange-100 text-center"
        >
          <div className="text-7xl mb-6 transform hover:scale-110 transition-transform" aria-hidden="true">
            {currentQuestion.icon}
          </div>
          
          <fieldset>
            <legend className="sr-only">Question {step + 1}</legend>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                aria-label={`Yes to: ${currentQuestion.text}`}
                className="bg-green-500 text-white font-bold py-6 rounded-2xl hover:bg-green-600 focus-visible:ring-4 focus-visible:ring-green-500 transition-all shadow-lg shadow-green-100 active:scale-95 min-h-[44px]"
              >
                <div className="text-2xl mb-1" aria-hidden="true">✅</div>
                Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                aria-label={`No to: ${currentQuestion.text}`}
                className="bg-red-500 text-white font-bold py-6 rounded-2xl hover:bg-red-600 focus-visible:ring-4 focus-visible:ring-red-500 transition-all shadow-lg shadow-red-100 active:scale-95 min-h-[44px]"
              >
                <div className="text-2xl mb-1" aria-hidden="true">❌</div>
                No / Not Sure
              </button>
            </div>
          </fieldset>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-gray-500 text-sm mt-8">
        Your answers help us create a personalized preparation guide.
      </p>
    </div>
  );
};
