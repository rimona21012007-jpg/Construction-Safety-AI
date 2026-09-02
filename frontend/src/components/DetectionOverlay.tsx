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

  // Compute unique classes for legend
  const classCounts = detections.reduce((acc, det) => {
    const cls = det.class_name.toUpperCase();
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="relative">
      <div ref={containerRef} className="relative inline-block max-w-full rounded-none overflow-hidden border-4 border-gray-900 bg-gray-100">
        <img 
          ref={imageRef} 
          src={imageUrl} 
          alt="Construction Site Inspection" 
          className="max-w-full h-auto max-h-[70vh] object-contain block"
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
              className="absolute border-[3px] border-blue-600 bg-blue-600/10 transition-all duration-300 print:border-black print:bg-transparent"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              <div className="absolute -top-[22px] left-[-3px] bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 whitespace-nowrap z-10 print:bg-black">
                {det.class_name} ({(det.confidence * 100).toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>

      {showDetections && Object.keys(classCounts).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center print:hidden">
          {Object.entries(classCounts).map(([cls, count]) => (
            <div key={cls} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-sm border border-gray-200">
              <div className="w-2 h-2 bg-blue-600 rounded-none"></div>
              <span className="text-xs font-bold text-gray-900">{cls}</span>
              <span className="text-xs font-medium text-gray-500">({count})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
