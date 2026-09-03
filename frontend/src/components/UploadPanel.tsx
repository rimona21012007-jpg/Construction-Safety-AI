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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-none shadow-sm border border-gray-200">
      <div 
        className={`border-2 border-dashed m-4 p-8 text-center transition-all bg-white ${
          previewUrl ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div>
            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-none border border-gray-300" />
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all rounded-sm"
                disabled={isLoading}
              >
                Remove Image
              </button>
              <button
                onClick={() => selectedFile && onAnalyze(selectedFile)}
                disabled={isLoading}
                className="px-8 py-2 text-sm font-bold text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Run Inspection'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drag and drop site image</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">or click to browse from your computer</p>
            <div className="inline-block px-4 py-1 bg-gray-100 border border-gray-200">
              <p className="text-xs text-gray-500 font-bold uppercase">Supported formats: JPEG, PNG</p>
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
