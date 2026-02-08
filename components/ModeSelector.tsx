
import React from 'react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  theme: 'dark' | 'light';
  questionCount: number;
  setQuestionCount: (n: number) => void;
  onSelect: (mode: GenerationMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ theme, questionCount, setQuestionCount, onSelect }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-xl';

  return (
    <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-6 tracking-tighter">Configure Your Session</h2>
        <div className={`w-full max-w-md mx-auto p-10 rounded-[2.5rem] border mb-12 transition-colors ${cardBg}`}>
          <div className="flex justify-between items-center mb-8">
            <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Items to Generate</span>
            <span className="text-4xl font-black text-cyan-500 font-mono">{questionCount}</span>
          </div>
          <input 
            type="range" min="5" max="30" value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-cyan-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <button 
          onClick={() => onSelect(GenerationMode.FLASHCARDS)}
          className={`group p-12 border rounded-[3rem] transition-all text-left flex flex-col items-start gap-8 ${cardBg} hover:border-cyan-500/50 hover:bg-cyan-500/5`}
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
            📇
          </div>
          <h3 className="text-3xl font-black tracking-tight">Flashcards</h3>
        </button>

        <button 
          onClick={() => onSelect(GenerationMode.QUIZ)}
          className={`group p-12 border rounded-[3rem] transition-all text-left flex flex-col items-start gap-8 ${cardBg} hover:border-purple-500/50 hover:bg-purple-500/5`}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
            📝
          </div>
          <h3 className="text-3xl font-black tracking-tight">Practice Quiz</h3>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
