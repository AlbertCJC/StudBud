
import React, { useState } from 'react';
import { FlashcardData } from '../types';

interface FlashcardProps {
  data: FlashcardData;
}

const Flashcard: React.FC<FlashcardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-1000 w-full h-80 md:h-[400px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl group-hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">Question</span>
          </div>
          <p className="text-center text-xl md:text-2xl font-semibold text-slate-100 leading-snug">
            {data.question}
          </p>
          <div className="absolute bottom-8 text-slate-500 text-xs font-medium uppercase tracking-widest">
            Click to Flip
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-slate-800 border border-cyan-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,211,238,0.1)]">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Answer</span>
          </div>
          <p className="text-center text-slate-200 text-lg md:text-xl leading-relaxed max-w-md">
            {data.answer}
          </p>
          <div className="absolute bottom-8 text-slate-500 text-xs font-medium uppercase tracking-widest">
            Click to Revert
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
