
import React from 'react';

interface InsufficientContentDialogProps {
  theme: 'dark' | 'light';
  onRetry: () => void;
  onSearchInternet: () => void;
}

const InsufficientContentDialog: React.FC<InsufficientContentDialogProps> = ({ theme, onRetry, onSearchInternet }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200';
  
  return (
    <div className={`p-10 rounded-[3rem] border shadow-2xl max-w-lg text-center animate-in fade-in zoom-in-95 ${cardBg}`}>
      <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-black mb-4 tracking-tighter">Not Enough Intel</h2>
      <p className={`mb-10 font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        The content provided is too brief to generate a quality study set. Would you like StudBud to research this topic on the internet instead?
      </p>
      <div className="flex flex-col gap-4">
        <button 
          onClick={onSearchInternet}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all active:scale-95"
        >
          Yes, Research on Internet
        </button>
        <button 
          onClick={onRetry}
          className={`w-full py-4 border font-black rounded-2xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
        >
          Try a Different File
        </button>
      </div>
    </div>
  );
};

export default InsufficientContentDialog;
