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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          previewUrl ? 'border-gray-300' : 'border-blue-300 hover:border-blue-400 bg-blue-50/50'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-md" />
            <div className="mt-4 flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Remove Image
              </button>
              <button
                onClick={() => selectedFile && onAnalyze(selectedFile)}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Analyzing image...' : 'Analyze Site'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drag and drop site image</h3>
            <p className="text-sm text-gray-500 mb-4">or click to browse from your computer</p>
            <p className="text-xs text-gray-400">Supported formats: JPEG, PNG</p>
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
