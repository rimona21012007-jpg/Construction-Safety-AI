import React, { useRef, useEffect, useState } from 'react';
import type { Detection } from '../types';

interface DetectionOverlayProps {
  imageUrl: string;
  detections: Detection[];
  showDetections: boolean;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ imageUrl, detections, showDetections }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && containerRef.current) {
        // Calculate scale between original image size and displayed size
        const displayedWidth = imageRef.current.width;
        const displayedHeight = imageRef.current.height;
        const naturalWidth = imageRef.current.naturalWidth;
        const naturalHeight = imageRef.current.naturalHeight;

        if (naturalWidth && naturalHeight) {
          setScale({
            x: displayedWidth / naturalWidth,
            y: displayedHeight / naturalHeight,
          });
        }
      }
    };

    // Add load event listener to the image
    if (imageRef.current) {
      if (imageRef.current.complete) {
        handleResize();
      } else {
        imageRef.current.addEventListener('load', handleResize);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', handleResize);
      }
    };
  }, [imageUrl, showDetections]);

  return (
    <div ref={containerRef} className="relative inline-block max-w-full rounded-lg overflow-hidden border border-gray-200">
      <img 
        ref={imageRef} 
        src={imageUrl} 
        alt="Construction Site Inspection" 
        className="max-w-full h-auto max-h-[70vh] object-contain"
      />
      
      {showDetections && detections.map((det, idx) => {
        const { x1, y1, x2, y2 } = det.bounding_box;
        const width = (x2 - x1) * scale.x;
        const height = (y2 - y1) * scale.y;
        const top = y1 * scale.y;
        const left = x1 * scale.x;

        return (
          <div
            key={idx}
            className="absolute border-2 border-red-500 bg-red-500/10"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            <div className="absolute -top-6 left-[-2px] bg-red-500 text-white text-xs font-bold px-2 py-1 whitespace-nowrap z-10">
              {det.class_name.toUpperCase()} ({(det.confidence * 100).toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};
