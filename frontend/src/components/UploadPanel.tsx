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
    <div className="w-full max-w-2xl mx-auto p-1.5 bg-white/30 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/60 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_16px_48px_0_rgba(31,38,135,0.25)]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div 
        className={`relative z-10 border-2 border-dashed rounded-[1.7rem] p-10 text-center transition-all duration-500 bg-white/50 backdrop-blur-lg ${
          previewUrl ? 'border-cyan-400/50 shadow-[inset_0_0_20px_rgba(34,211,238,0.15)]' : 'border-blue-400/40 hover:border-blue-500/80 hover:bg-white/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg ring-1 ring-black/5" />
            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-md transition-all backdrop-blur-sm"
                disabled={isLoading}
              >
                Remove Image
              </button>
              <button
                onClick={() => selectedFile && onAnalyze(selectedFile)}
                disabled={isLoading}
                className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
              >
                {isLoading ? 'Analyzing image...' : 'Analyze Site'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 cursor-pointer group/inner" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover/inner:scale-110 group-hover/inner:bg-blue-500/20 group-hover/inner:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
              <UploadCloud className="w-12 h-12 text-blue-500 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Drag and drop site image</h3>
            <p className="text-sm text-gray-600 mb-8 font-medium">or click to browse from your computer</p>
            <div className="inline-block px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
              <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase">Supported formats: JPEG, PNG</p>
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
