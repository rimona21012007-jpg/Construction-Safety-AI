import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadPanelProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-6">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          previewUrl ? 'border-white/20 bg-black/20' : 'border-cyan-400/50 hover:border-cyan-300 bg-blue-900/20 hover:bg-blue-900/40 backdrop-blur-md'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative animate-in fade-in zoom-in-95 duration-300">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-2xl border border-white/10" />
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-all backdrop-blur-sm"
                disabled={isLoading}
              >
                Remove Image
              </button>
              <button
                onClick={() => selectedFile && onAnalyze(selectedFile)}
                disabled={isLoading}
                className="px-8 py-2 text-sm font-bold text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? 'Analyzing image...' : 'Analyze Site'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-500">
              <UploadCloud className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2 tracking-wide">Drag and drop site image</h3>
            <p className="text-sm text-blue-100/60 mb-4 font-light">or click to browse from your computer</p>
            <div className="inline-block px-3 py-1 bg-black/30 rounded-full border border-white/5">
              <p className="text-xs text-cyan-200/50 uppercase tracking-widest font-bold">Supported formats: JPEG, PNG</p>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
};
