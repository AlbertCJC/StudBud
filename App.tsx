
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [inputTab, setInputTab] = useState<'file' | 'text'>('file');
  
  const pendingContent = useRef<string | { mimeType: string, data: string } | null>(null);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleFileSelect = async (file: File) => {
    try {
      let content: any;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result.split(',')[1]);
          };
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;
        content = { mimeType: file.type, data: base64Data };
      } else {
        content = await file.text();
      }
      
      pendingContent.current = content;
      setState(AppState.SELECTING_MODE);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read file. Please try a different format.");
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
    const progressInterval = simulateProgress();

    try {
      const generatedData = await generateStudyMaterial(pendingContent.current, selectedMode, questionCount);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setStudyData(generatedData);
        setCurrentCardIndex(0);
        setState(AppState.VIEWING);
        pendingContent.current = null;
      }, 500);

    } catch (err) {
      console.error(err);
      setErrorMsg("Gemini AI failed to process the content. Please ensure the source has enough information to generate the requested number of items.");
      setState(AppState.ERROR);
      clearInterval(progressInterval);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    const margin = 25.4; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    const titleText = mode === GenerationMode.FLASHCARDS ? "StudBud Study Flashcards" : "StudBud Practice Quiz";
    
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(titleText, margin, margin);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, margin + 6);
    
    let y = margin + 18;
    
    studyData.forEach((item, index) => {
      const estimatedHeight = mode === GenerationMode.FLASHCARDS ? 40 : 55;
      if (y + estimatedHeight > 270) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. QUESTION`, margin, y);
      doc.setFont("helvetica", "normal");
      
      const questionLines = doc.splitTextToSize(item.question, contentWidth);
      doc.text(questionLines, margin, y + 5);
      y += 8 + (questionLines.length * 4.2);

      if (mode === GenerationMode.FLASHCARDS) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text("ANSWER", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);
        const answerLines = doc.splitTextToSize(item.answer, contentWidth);
        doc.text(answerLines, margin, y + 5);
        y += 12 + (answerLines.length * 4.2);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text("OPTIONS", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);
        item.options.forEach((opt: string, i: number) => {
          const isCorrect = opt === item.correctAnswer;
          const prefix = isCorrect ? "[CORRECT] " : "[ ] ";
          doc.text(`${prefix} ${String.fromCharCode(65 + i)}) ${opt}`, margin + 4, y + 5 + (i * 5));
        });
        y += 32;
      }
      
      doc.setDrawColor(230);
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
      y += 8;
    });

    doc.save(`StudBud-${mode.toLowerCase()}-${Date.now()}.pdf`);
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setStudyData([]);
    setCurrentCardIndex(0);
    setProgress(0);
    setErrorMsg(null);
    setTextInput('');
    pendingContent.current = null;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const nextCard = useCallback(() => {
    if (currentCardIndex < studyData.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  }, [currentCardIndex, studyData.length]);

  const prevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  }, [currentCardIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== AppState.VIEWING) return;
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, nextCard, prevCard]);

  const bgClass = theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900';
  const navBg = theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white/70 border-slate-200';
  const subTextClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const inputBgClass = theme === 'dark' ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-inner';

  return (
    <div className={`min-h-screen flex flex-col selection:bg-cyan-500/30 transition-colors duration-300 ${bgClass}`}>
      {/* Header */}
      <nav className={`p-6 flex justify-between items-center border-b backdrop-blur-xl sticky top-0 z-50 transition-colors ${navBg}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 overflow-hidden border border-white/20">
             <img 
               src="./assets/logo.png" 
               className="w-full h-full object-cover grayscale brightness-110" 
               alt="StudBud Logo" 
               onError={(e) => { e.currentTarget.src = "https://img.freepik.com/premium-vector/owl-logo-design_677341-267.jpg" }}
             />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
            StudBud
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {state === AppState.VIEWING && (
            <div className="flex gap-2">
              <button 
                onClick={downloadPDF}
                className="px-5 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
              >
                Export PDF
              </button>
              <button 
                onClick={handleReset}
                className={`px-5 py-2 rounded-full border text-sm font-bold transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'}`}
              >
                New Session
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
        
        {state === AppState.IDLE && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Mascot Hero Section */}
            <div className="relative mb-6">
               <div className={`absolute inset-0 blur-3xl rounded-full transition-all duration-700 ${theme === 'dark' ? 'bg-cyan-500/10 opacity-60' : 'bg-cyan-100/50 opacity-40'}`} />
               <div className="relative animate-float mascot-glow">
                  <div className={`w-48 h-48 md:w-56 md:h-56 rounded-[3rem] overflow-hidden border-4 ${theme === 'dark' ? 'border-white/5 shadow-2xl shadow-cyan-500/10' : 'border-white shadow-xl shadow-slate-200'}`}>
                    <img 
                      src="./assets/mascot.png" 
                      alt="StudBud Owl Mascot"
                      className={`w-full h-full object-cover transition-all duration-700 ${theme === 'dark' ? 'brightness-90 contrast-125' : 'brightness-105'}`}
                      onError={(e) => { e.currentTarget.src = "https://images.squarespace-cdn.com/content/v1/5e949a92e17d55230cd1d44f/1614713833896-YJ5XN6W0S8R9B8N8K1B1/Owl+Logo+Design+by+Elias+Stein.jpg?format=1000w" }}
                    />
                  </div>
               </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tighter leading-tight">
                Meet <span className="text-cyan-500">StudBud</span>. <br/> Your AI Study Partner.
              </h2>
              <p className={`${subTextClass} text-lg md:text-xl max-w-xl mx-auto mb-10 font-medium`}>
                Upload notes or paste text to generate interactive flashcards and practice quizzes in seconds.
              </p>

              <div className={`inline-flex p-1.5 rounded-[1.5rem] border mb-10 backdrop-blur-sm shadow-md transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                <button
                  onClick={() => setInputTab('file')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${inputTab === 'file' ? 'bg-cyan-500 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Source File
                </button>
                <button
                  onClick={() => setInputTab('text')}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${inputTab === 'text' ? 'bg-cyan-500 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Custom Text
                </button>
              </div>
            </div>

            {inputTab === 'file' ? (
              <FileUpload onFileSelect={handleFileSelect} isLoading={false} theme={theme} />
            ) : (
              <div className="w-full max-w-3xl flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your notes, lecture transcript, or study guide content here..."
                  className={`w-full h-80 p-8 rounded-[3rem] border-2 border-dashed focus:border-cyan-500 focus:ring-8 focus:ring-cyan-500/10 outline-none transition-all resize-none font-medium text-lg leading-relaxed ${inputBgClass}`}
                />
                <button
                  disabled={!textInput.trim()}
                  onClick={handleTextInputSubmit}
                  className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed text-slate-950 font-black rounded-[1.5rem] shadow-[0_20px_40px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xl"
                >
                  Generate Study Set
                </button>
              </div>
            )}
          </div>
        )}

        {state === AppState.SELECTING_MODE && (
          <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tighter">Configure Study Session</h2>
              <div className={`w-full max-w-md mx-auto p-10 rounded-[2.5rem] border mb-12 shadow-sm transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Question Count</span>
                  <span className="text-4xl font-black text-cyan-500 font-mono tracking-tighter">{questionCount}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  step="1" 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
              <button 
                onClick={() => startGeneration(GenerationMode.FLASHCARDS)}
                className={`group relative p-12 border rounded-[3.5rem] transition-all duration-300 text-left flex flex-col items-start gap-10 shadow-2xl active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900 border-white/10 hover:border-cyan-500/50 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:border-cyan-500 hover:shadow-cyan-500/10'}`}
              >
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Flashcards</h3>
              </button>

              <button 
                onClick={() => startGeneration(GenerationMode.QUIZ)}
                className={`group relative p-12 border rounded-[3.5rem] transition-all duration-300 text-left flex flex-col items-start gap-10 shadow-2xl active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900 border-white/10 hover:border-purple-500/50 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:border-purple-500 hover:shadow-purple-500/10'}`}
              >
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Practice Quiz</h3>
              </button>
            </div>
          </div>
        )}

        {state === AppState.PROCESSING && (
          <div className="w-full max-w-md flex flex-col items-center gap-12 animate-in fade-in duration-500">
            <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500 ease-out shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-cyan-500 font-black text-2xl mb-3 animate-pulse">Analyzing Content...</p>
            </div>
          </div>
        )}

        {state === AppState.VIEWING && studyData.length > 0 && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black mb-3 tracking-tighter">
                {mode === GenerationMode.FLASHCARDS ? 'Concept Master' : 'Expert Quiz'}
              </h2>
            </div>

            <div className="relative group">
              {mode === GenerationMode.FLASHCARDS ? (
                <Flashcard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex] as FlashcardData} theme={theme} />
              ) : (
                <QuizCard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex] as QuizData} theme={theme} />
              )}
            </div>

            <div className="mt-14 flex items-center justify-center gap-8">
              <button onClick={prevCard} disabled={currentCardIndex === 0} className={`p-6 rounded-[1.5rem] border transition-all ${currentCardIndex === 0 ? 'opacity-20' : `shadow-lg active:scale-90 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={nextCard} className="px-16 py-5 rounded-[2rem] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl transition-all shadow-[0_20px_50px_rgba(34,211,238,0.5)] active:scale-95">
                {currentCardIndex === studyData.length - 1 ? 'Finish Review' : 'Next Card'}
              </button>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="text-center max-w-lg animate-in fade-in zoom-in-95 duration-500 bg-red-500/5 p-14 rounded-[4rem] border border-red-500/20 shadow-2xl">
            <h2 className="text-4xl font-black mb-5 tracking-tight">System Error</h2>
            <p className={`${subTextClass} mb-12 font-bold text-lg leading-relaxed opacity-80`}>{errorMsg}</p>
            <button onClick={handleReset} className="w-full py-6 bg-slate-800 text-white hover:bg-slate-700 rounded-[2rem] font-black transition-all active:scale-95 shadow-2xl text-lg">Restart Session</button>
          </div>
        )}
      </main>

      <footer className={`p-12 text-center text-[10px] font-black uppercase tracking-[0.4em] border-t transition-colors ${theme === 'dark' ? 'bg-slate-950/60 border-white/5 text-slate-700' : 'bg-white border-slate-200 text-slate-400'}`}>
        &copy; {new Date().getFullYear()} StudBud &bull; High Fidelity AI Study Partner
      </footer>
    </div>
  );
};

export default App;
