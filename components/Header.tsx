
import React from 'react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onReset: () => void;
  isViewing: boolean;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onReset, isViewing, onExport }) => {
  const navBg = theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white/70 border-slate-200';

  return (
    <nav className={`p-6 flex justify-between items-center border-b backdrop-blur-xl sticky top-0 z-50 transition-colors ${navBg}`}>
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onReset}>
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 transition-all group-hover:scale-105">
          StudBud
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className={`p-2.5 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {isViewing && (
          <div className="flex gap-2">
            <button 
              onClick={onExport}
              className="px-5 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-sm font-bold transition-all active:scale-95"
            >
              Export PDF
            </button>
            <button 
              onClick={onReset}
              className={`px-5 py-2 rounded-full border text-sm font-black transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-200 hover:bg-slate-300 border-slate-300'}`}
            >
              New
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;