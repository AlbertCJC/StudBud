
import React, { useState } from 'react';
import { GenerationMode } from '../types';

interface ModeSelectorProps {
  theme: 'dark' | 'light';
  questionCount: number | string;
  setQuestionCount: (n: number | string) => void;
  onSelect: (mode: GenerationMode, count: number) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ theme, questionCount, setQuestionCount, onSelect }) => {
  const [error, setError] = useState<string | null>(null);
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
    const count = Number(questionCount);

    if (questionCount === '' || !Number.isInteger(count) || count < 1 || count > 100) {
      setError('Please enter a number between 1 and 100.');
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    
    setError(null);
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

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-red-500/90 backdrop-blur-sm text-white font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
