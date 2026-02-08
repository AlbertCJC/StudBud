
import React from 'react';

interface TextInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  theme: 'dark' | 'light';
}

const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, onSubmit, theme }) => {
  const inputBg = theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900';
  
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your notes here for instant AI-powered generation..."
        className={`w-full h-80 p-8 rounded-[2.5rem] border-2 border-dashed focus:border-cyan-500 focus:ring-8 focus:ring-cyan-500/5 outline-none transition-all resize-none font-medium text-lg ${inputBg}`}
      />
      <button 
        disabled={!value.trim()} 
        onClick={onSubmit}
        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-2 text-xl"
      >
        Analyze Content
      </button>
    </div>
  );
};

export default TextInputArea;
