
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import FileUpload from './components/FileUpload';
import Flashcard from './components/Flashcard';
import QuizCard from './components/QuizCard';
import Hero from './components/Hero';
import InputToggle from './components/InputToggle';
import TextInputArea from './components/TextInputArea';
import TopicInputArea from './components/TopicInputArea';
import ProcessingStatus from './components/ProcessingStatus';
import StudyNavigator from './components/StudyNavigator';
import InsufficientContentDialog from './components/InsufficientContentDialog';
import { AppState, GenerationMode, InputTab } from './types';
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
  const [topicInput, setTopicInput] = useState('');
  const [inputTab, setInputTab] = useState<InputTab>('text');
  const [isUsingSearch, setIsUsingSearch] = useState(false);
  
  const pendingContent = useRef<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      if (file.size === 0) throw new Error("The selected file is empty.");
      const content = await file.text();
      
      // Extraction Check: Need at least 100 characters of "meat"
      const cleanedContent = content.trim().replace(/\s+/g, ' ');
      const hasReadableText = /[a-zA-Z0-9]{100,}/.test(cleanedContent);
      
      if (!hasReadableText) {
        // Fallback: If content is too short, we treat the file name or brief content as a topic search seed
        pendingContent.current = cleanedContent || file.name.split('.')[0];
        setState(AppState.INSUFFICIENT_CONTENT);
        return;
      }

      pendingContent.current = cleanedContent;
      setIsUsingSearch(false);
      setState(AppState.SELECTING_MODE);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to read file.");
      setState(AppState.ERROR);
    }
  };

  const handleTextInputSubmit = () => {
    if (!textInput.trim()) return;
    pendingContent.current = textInput;
    setIsUsingSearch(false);
    setState(AppState.SELECTING_MODE);
  };

  const handleTopicSubmit = () => {
    if (!topicInput.trim()) return;
    pendingContent.current = topicInput;
    setIsUsingSearch(true);
    setState(AppState.SELECTING_MODE);
  };

  const startGeneration = async (selectedMode: GenerationMode) => {
    if (!pendingContent.current) return;
    setMode(selectedMode);
    setState(AppState.PROCESSING);
    setProgress(20);

    try {
      const generatedData = await generateStudyMaterial(
        pendingContent.current, 
        selectedMode, 
        questionCount, 
        isUsingSearch
      );
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
    setTopicInput('');
    setIsUsingSearch(false);
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
            <Hero theme={theme} />
            
            <InputToggle 
              activeTab={inputTab} 
              onTabChange={setInputTab} 
              theme={theme} 
            />

            <div className="w-full flex justify-center">
              {inputTab === 'text' && (
                <TextInputArea 
                  value={textInput} 
                  onChange={setTextInput} 
                  onSubmit={handleTextInputSubmit} 
                  theme={theme} 
                />
              )}
              {inputTab === 'file' && (
                <FileUpload onFileSelect={handleFileSelect} isLoading={false} theme={theme} />
              )}
              {inputTab === 'topic' && (
                <TopicInputArea 
                  value={topicInput} 
                  onChange={setTopicInput} 
                  onSubmit={handleTopicSubmit} 
                  theme={theme} 
                />
              )}
            </div>
          </div>
        )}

        {state === AppState.INSUFFICIENT_CONTENT && (
          <InsufficientContentDialog 
            theme={theme}
            onRetry={() => setState(AppState.IDLE)}
            onSearchInternet={() => {
              setIsUsingSearch(true);
              setState(AppState.SELECTING_MODE);
            }}
          />
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
          <ProcessingStatus progress={progress} theme={theme} />
        )}

        {state === AppState.VIEWING && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95">
            {mode === GenerationMode.FLASHCARDS ? (
              <Flashcard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex]} theme={theme} />
            ) : (
              <QuizCard key={studyData[currentCardIndex].id} data={studyData[currentCardIndex]} theme={theme} />
            )}
            <StudyNavigator 
              currentIndex={currentCardIndex}
              total={studyData.length}
              onPrev={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
              onNext={() => setCurrentCardIndex(prev => Math.min(studyData.length - 1, prev + 1))}
              theme={theme}
            />
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="text-center p-12 rounded-[4rem] border border-red-500/20 bg-red-500/5 max-w-lg shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-red-500 mb-4">Generation Failed</h2>
            <p className="text-slate-400 mb-8 font-medium">{errorMsg}</p>
            <button onClick={handleReset} className="w-full py-4 bg-slate-800 text-white hover:bg-slate-700 rounded-2xl font-black transition-all active:scale-95">Return Home</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
