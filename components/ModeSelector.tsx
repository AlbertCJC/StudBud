
import React from 'react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  theme: 'dark' | 'light';
  questionCount: number | string;
  setQuestionCount: (n: number | string) => void;
  onSelect: (mode: GenerationMode, count: number) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ theme, questionCount, setQuestionCount, onSelect }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-xl';
  const inputBg = theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100';

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow the input to be empty, otherwise store as a number.
    const value = e.target.value;
    if (value === '') {
      setQuestionCount('');
    } else {
      setQuestionCount(e.target.valueAsNumber);
    }
  };

  const handleSelectWithValidation = (mode: GenerationMode) => {
    let count = Number(questionCount);

    if (!Number.isInteger(count) || count < 1) {
      count = 1;
    } else if (count > 100) {
      count = 100;
    }
    
    setQuestionCount(count);
    onSelect(mode, count);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-6 tracking-tighter">Configure Your Session</h2>
        <div className={`w-full max-w-md mx-auto p-10 rounded-[2.5rem] border mb-6 transition-colors ${cardBg}`}>
          <label htmlFor="question-count" className="block text-center font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-6">
            Items to Generate
          </label>
          <input 
            id="question-count"
            type="number"
            min="1"
            max="100"
            value={questionCount}
            onChange={handleCountChange}
            className={`w-40 h-24 mx-auto text-center text-6xl font-black text-cyan-500 font-mono focus:outline-none focus:ring-4 focus:ring-cyan-500/20 border-none rounded-2xl transition-all ${inputBg}`}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-6">
        <button 
          onClick={() => handleSelectWithValidation(GenerationMode.FLASHCARDS)}
          className={`group p-12 border rounded-[3rem] transition-all text-left flex flex-col items-start gap-8 ${cardBg} hover:border-cyan-500/50 hover:bg-cyan-500/5`}
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
            📇
          </div>
          <h3 className="text-3xl font-black tracking-tight">Flashcards</h3>
        </button>

        <button 
          onClick={() => handleSelectWithValidation(GenerationMode.QUIZ)}
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
