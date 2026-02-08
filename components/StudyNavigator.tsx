
import React from 'react';

interface StudyNavigatorProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  theme: 'dark' | 'light';
}

const StudyNavigator: React.FC<StudyNavigatorProps> = ({ currentIndex, total, onPrev, onNext, theme }) => {
  const btnClass = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-md';
  
  return (
    <div className="mt-14 flex items-center justify-center gap-8">
      <button 
        onClick={onPrev} 
        disabled={currentIndex === 0}
        className={`p-6 rounded-2xl border transition-all ${currentIndex === 0 ? 'opacity-10 cursor-not-allowed' : `active:scale-90 hover:bg-cyan-500/10 ${btnClass}`}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <div className="flex flex-col items-center">
        <span className="font-mono text-cyan-500 font-black text-2xl">{currentIndex + 1}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">of {total}</span>
      </div>
      
      <button 
        onClick={onNext} 
        disabled={currentIndex === total - 1}
        className={`p-6 rounded-2xl border transition-all ${currentIndex === total - 1 ? 'opacity-10 cursor-not-allowed' : `active:scale-90 hover:bg-cyan-500/10 ${btnClass}`}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

export default StudyNavigator;
