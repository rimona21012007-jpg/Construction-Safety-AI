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
      <div ref={containerRef} className="relative inline-block max-w-full rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black/40">
        <img 
          ref={imageRef} 
          src={imageUrl} 
          alt="Construction Site Inspection" 
          className="max-w-full h-auto max-h-[70vh] object-contain block opacity-90"
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
              className="absolute border-[2px] border-cyan-400 bg-cyan-400/10 transition-all duration-300 print:border-black print:bg-transparent shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              <div className="absolute -top-[24px] left-[-2px] bg-cyan-500/80 backdrop-blur-md border border-cyan-400 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 whitespace-nowrap z-10 print:bg-black rounded-sm shadow-md">
                {det.class_name} <span className="opacity-70 font-medium">({(det.confidence * 100).toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {showDetections && Object.keys(classCounts).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center print:hidden">
          {Object.entries(classCounts).map(([cls, count]) => (
            <div key={cls} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-md border border-white/10 backdrop-blur-sm shadow-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
              <span className="text-xs font-bold text-white tracking-wider">{cls}</span>
              <span className="text-xs font-medium text-cyan-200/50">({count})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
