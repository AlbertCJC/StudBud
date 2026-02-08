
import React from 'react';

interface ProcessingStatusProps {
  progress: number;
  theme: 'dark' | 'light';
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ progress, theme }) => {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-12 animate-in fade-in">
      <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="text-center">
        <p className="text-cyan-500 font-black text-2xl animate-pulse mb-2">Cerebras LPU Speed</p>
        <p className={`text-xs uppercase tracking-widest font-bold opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Generating with Llama 3.1...
        </p>
      </div>
    </div>
  );
};

export default ProcessingStatus;