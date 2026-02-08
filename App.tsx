
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import FileUpload from './components/FileUpload';
import Flashcard from './components/Flashcard';
import QuizCard from './components/QuizCard';
import { FlashcardData, QuizData, AppState, GenerationMode } from './types';
import { generateStudyMaterial } from './services/gemini';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.FLASHCARDS);
  const [studyData, setStudyData] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [textInput, setTextInput] = useState('');
  const [inputTab, setInputTab] = useState<'file' | 'text'>('text');
  
  const pendingContent = useRef<string | { mimeType: string, data: string } | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      const content = await file.text();
      pendingContent.current = content;
      setState(AppState.SELECTING_MODE);
    } catch (err) {
      setErrorMsg("Failed to read file. Please ensure it is a valid text file.");
      setState(AppState.ERROR);
    }
  };

  const handleTextInputSubmit = () => {
    if (!textInput.trim()) return;
    pendingContent.current = textInput;
    setState(AppState.SELECTING_MODE);
  };

  const startGeneration = async (selectedMode: GenerationMode) => {
    if (!pendingContent.current) return;
    setMode(selectedMode);
    setState(AppState.PROCESSING);
    setProgress(20);

    try {
      const generatedData = await generateStudyMaterial(pendingContent.current, selectedMode, questionCount);
      setProgress(100);
      setTimeout(() => {
        setStudyData(generatedData);
        setCurrentCardIndex(0);
        setState(AppState.VIEWING);
      }, 200);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setStudyData([]);
    setErrorMsg(null);
    setTextInput('');
    pendingContent.current = null;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(mode === GenerationMode.FLASHCARDS ? "Flashcards" : "Quiz", 10, 10);
    studyData.forEach((item, i) => {
      doc.text(`${i+1}. ${item.question}`, 10, 20 + (i * 15));
    });
    doc.save(`study-material.pdf`);
  };

  const bgClass = theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${bgClass}`}>
      <Header 
        theme={theme} 
        toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
        onReset={handleReset} 
        isViewing={state === AppState.VIEWING}
        onExport={downloadPDF}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-7xl mx-auto w-full">
        {state === AppState.IDLE && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter">
                Learn <span className="text-cyan-500 italic">Faster</span>.
              </h2>
              <div className="flex gap-4 p-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-12">
                <button onClick={() => setInputTab('text')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${inputTab === 'text' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>Text Content</button>
                <button onClick={() => setInputTab('file')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${inputTab === 'file' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>Upload File</button>
              </div>
            </div>

            {inputTab === 'text' ? (
              <div className="w-full max-w-3xl flex flex-col gap-6">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your notes here for instant Cerebras-powered generation..."
                  className={`w-full h-80 p-8 rounded-[3rem] border-2 border-dashed focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all resize-none font-medium text-lg ${theme === 'dark' ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'}`}
                />
                <button 
                  disabled={!textInput.trim()} 
                  onClick={handleTextInputSubmit}
                  className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-20"
                >
                  Confirm Study Content
                </button>
              </div>
            ) : (
              <FileUpload onFileSelect={handleFileSelect} isLoading={false} theme={theme} />
            )}
          </div>
        )}

        {state === AppState.SELECTING_MODE && (
          <ModeSelector 
            theme={theme} 
            questionCount={questionCount} 
            setQuestionCount={setQuestionCount} 
            onSelect={startGeneration} 
          />
        )}

        {state === AppState.PROCESSING && (
          <div className="w-full max-w-md flex flex-col items-center gap-12 animate-in fade-in">
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-cyan-500 font-black text-2xl animate-pulse">Cerebras LPU processing...</p>
          </div>
        )}

        {state === AppState.VIEWING && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95">
            {mode === GenerationMode.FLASHCARDS ? (
              <Flashcard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex]} theme={theme} />
            ) : (
              <QuizCard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex]} theme={theme} />
            )}
            <div className="mt-14 flex items-center justify-center gap-8">
              <button onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))} className="p-6 rounded-full border border-white/10 bg-white/5">←</button>
              <span className="font-mono text-cyan-500 font-bold">{currentCardIndex + 1} / {studyData.length}</span>
              <button onClick={() => setCurrentCardIndex(Math.min(studyData.length - 1, currentCardIndex + 1))} className="p-6 rounded-full border border-white/10 bg-white/5">→</button>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="text-center p-12 rounded-[3rem] border border-red-500/20 bg-red-500/5 max-w-lg">
            <h2 className="text-3xl font-black text-red-500 mb-4">Error</h2>
            <p className="text-slate-400 mb-8">{errorMsg}</p>
            <button onClick={handleReset} className="px-8 py-3 bg-slate-800 rounded-full font-bold">Try Again</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
