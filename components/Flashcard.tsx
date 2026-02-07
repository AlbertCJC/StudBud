
import React, { useState } from 'react';
import { FlashcardData } from '../types';

interface FlashcardProps {
  data: FlashcardData;
  theme: 'dark' | 'light';
}

const Flashcard: React.FC<FlashcardProps> = ({ data, theme }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontBg = theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 text-slate-900';
  const backBg = theme === 'dark' ? 'bg-slate-800 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200 text-slate-900';

  return (
    <div 
      className="group perspective-1000 w-full h-80 md:h-[400px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 border rounded-[2.5rem] shadow-2xl transition-all ${frontBg}`}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-cyan-500 text-xs font-bold uppercase tracking-[0.2em]">Question</span>
          </div>
          <p className="text-center text-xl md:text-2xl font-semibold leading-snug">
            {data.question}
          </p>
          <div className={`absolute bottom-8 text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Click to Flip
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 border rounded-[2.5rem] shadow-xl transition-all ${backBg}`}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-blue-500 text-xs font-bold uppercase tracking-[0.2em]">Answer</span>
          </div>
          <p className="text-center text-lg md:text-xl leading-relaxed max-w-md">
            {data.answer}
          </p>
          <div className={`absolute bottom-8 text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Click to Revert
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
