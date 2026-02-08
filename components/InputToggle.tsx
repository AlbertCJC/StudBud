
import React from 'react';
import { InputTab } from '../types';

interface InputToggleProps {
  activeTab: InputTab;
  onTabChange: (tab: InputTab) => void;
  theme: 'dark' | 'light';
}

const InputToggle: React.FC<InputToggleProps> = ({ activeTab, onTabChange, theme }) => {
  const containerBg = theme === 'dark' ? 'bg-slate-900/60 border-white/10' : 'bg-slate-100 border-slate-200';
  
  const tabs: { id: InputTab; label: string }[] = [
    { id: 'text', label: 'Text' },
    { id: 'file', label: 'File' },
    { id: 'topic', label: 'Topic' }
  ];

  return (
    <div className="w-full flex justify-center mb-12">
      <div className={`flex p-1 rounded-2xl border w-full max-w-md shadow-xl transition-all ${containerBg}`}>
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)} 
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-cyan-500 text-slate-950 shadow-lg' 
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputToggle;
