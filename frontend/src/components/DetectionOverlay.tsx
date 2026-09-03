import React from 'react';

interface DetectionOverlayProps {
  originalImageUrl: string;
  annotatedImageBase64: string | null;
  showDetections: boolean;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ originalImageUrl, annotatedImageBase64, showDetections }) => {
  const displayUrl = showDetections && annotatedImageBase64 
    ? `data:image/jpeg;base64,${annotatedImageBase64}` 
    : originalImageUrl;

  return (
    <div className="relative flex justify-center">
      <div className="relative inline-block max-w-full rounded-none overflow-hidden border-4 border-gray-900 bg-gray-100">
        <img 
          src={displayUrl} 
          alt={showDetections ? "AI Annotated Detections" : "Original Uploaded Image"} 
          className="max-w-full h-auto max-h-[70vh] object-contain block"
        />
      </div>
    </div>
  );
};
