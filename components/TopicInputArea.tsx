
import React from 'react';

interface TopicInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  theme: 'dark' | 'light';
}

const TopicInputArea: React.FC<TopicInputAreaProps> = ({ value, onChange, onSubmit, theme }) => {
  const inputBg = theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900';
  
  return (
    <div className="w-full max-w-2xl flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 items-center">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What topic do you want to master?"
          className={`w-full py-8 px-10 rounded-[2.5rem] border-2 focus:border-cyan-500 focus:ring-8 focus:ring-cyan-500/5 outline-none transition-all font-black text-2xl text-center shadow-inner ${inputBg}`}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          Web Search Grounded
        </div>
      </div>
      <button 
        disabled={!value.trim()} 
        onClick={onSubmit}
        className="w-64 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-2 text-xl"
      >
        Start Research
      </button>
    </div>
  );
};

export default TopicInputArea;
