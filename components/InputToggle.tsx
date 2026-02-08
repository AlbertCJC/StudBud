
import React from 'react';

interface InputToggleProps {
  activeTab: 'text' | 'file';
  onTabChange: (tab: 'text' | 'file') => void;
  theme: 'dark' | 'light';
}

const InputToggle: React.FC<InputToggleProps> = ({ activeTab, onTabChange, theme }) => {
  const containerBg = theme === 'dark' ? 'bg-slate-900/60 border-white/10' : 'bg-slate-100 border-slate-200';
  
  return (
    <div className="w-full flex justify-center mb-12">
      <div className={`flex p-1 rounded-2xl border w-full max-w-sm shadow-xl transition-all ${containerBg}`}>
        <button 
          onClick={() => onTabChange('text')} 
          className={`flex-1 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
            activeTab === 'text' 
              ? 'bg-cyan-500 text-slate-950 shadow-lg' 
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Text Content
        </button>
        <button 
          onClick={() => onTabChange('file')} 
          className={`flex-1 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
            activeTab === 'file' 
              ? 'bg-cyan-500 text-slate-950 shadow-lg' 
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Upload File
        </button>
      </div>
    </div>
  );
};

export default InputToggle;
