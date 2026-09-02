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
    <div className="w-full max-w-2xl mx-auto p-1.5 bg-white rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div 
        className={`relative z-10 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-500 bg-white ${
          previewUrl ? 'border-cyan-400 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]' : 'border-gray-300 hover:border-cyan-400'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-xl border border-gray-800" />
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
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
          <div className="py-12 cursor-pointer group/inner" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 group-hover/inner:scale-110 group-hover/inner:bg-cyan-500/20 transition-all duration-500">
              <UploadCloud className="w-10 h-10 text-cyan-500 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Drag and drop site image</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">or click to browse from your computer</p>
            <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Supported formats: JPEG, PNG</p>
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
