
import React from 'react';

interface HeroProps {
  theme: 'dark' | 'light';
}

const Hero: React.FC<HeroProps> = ({ theme }) => {
  return (
    <div className="text-center mb-12 max-w-4xl px-4">
      <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
        Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">StudBud.</span><br/>
        Your AI Study Partner.
      </h2>
      <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        Transform your study material into engaging flashcards or quizzes in seconds. Simply paste your text, upload a file (PDF, DOCX, PPTX), or enter a topic to get started.
      </p>
    </div>
  );
};

export default Hero;
