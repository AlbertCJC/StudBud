
import React, { useState, useEffect } from 'react';
import { QuizData } from '../types';

interface QuizCardProps {
  data: QuizData;
}

const QuizCard: React.FC<QuizCardProps> = ({ data }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Reset state when data changes
  useEffect(() => {
    setSelectedOption(null);
    setIsRevealed(false);
  }, [data.id]);

  const handleSelect = (option: string) => {
    if (isRevealed) return;
    setSelectedOption(option);
    setIsRevealed(true);
  };

  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        <span className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">Multiple Choice</span>
      </div>

      <h3 className="text-xl md:text-2xl font-semibold text-slate-100 leading-snug mb-8">
        {data.question}
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {data.options.map((option, idx) => {
          const isCorrect = option === data.correctAnswer;
          const isSelected = option === selectedOption;
          
          let stateStyles = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300";
          if (isRevealed) {
            if (isCorrect) {
              stateStyles = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            } else if (isSelected) {
              stateStyles = "bg-red-500/20 border-red-500/50 text-red-400";
            } else {
              stateStyles = "bg-white/5 border-white/10 text-slate-500 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={isRevealed}
              onClick={() => handleSelect(option)}
              className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center gap-4 ${stateStyles}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm border ${isRevealed && isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 border-white/10'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{option}</span>
              {isRevealed && isCorrect && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {isRevealed && (
        <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-cyan-400">
            {selectedOption === data.correctAnswer ? "Correct! Well done." : "Incorrect. The correct answer is highlighted."}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
