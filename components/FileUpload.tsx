
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative w-full max-w-2xl h-80 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4
        ${isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' : 'border-white/20 bg-white/5 hover:bg-white/10'}
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".txt,.pdf,.png,.jpg,.jpeg,.docx" 
      />
      
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 shadow-lg border border-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-100 mb-1">Upload Study Material</h3>
        <p className="text-slate-400 text-sm">Drag and drop 'Biology_Lecture.pptx' or any document</p>
      </div>

      <div className="flex gap-2 items-center text-xs text-slate-500 mt-4">
        <span className="px-2 py-1 bg-white/5 rounded border border-white/10">PDF</span>
        <span className="px-2 py-1 bg-white/5 rounded border border-white/10">TEXT</span>
        <span className="px-2 py-1 bg-white/5 rounded border border-white/10">IMAGES</span>
      </div>
    </div>
  );
};

export default FileUpload;
