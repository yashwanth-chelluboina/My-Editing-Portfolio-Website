import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  alt?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  alt = 'Before and after comparison'
}) => {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#06060a] border border-white/10 group select-none">
      {/* Base Image (After Color Grade) */}
      <img
        src={afterImage}
        alt={`${alt} After`}
        className="w-full max-h-[560px] object-contain mx-auto pointer-events-none"
      />

      {/* Overlay Image (Before Color Grade) */}
      <div
        className="absolute inset-0 top-0 left-0 w-full h-full pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={`${alt} Before`}
          className="w-full h-full object-contain mx-auto pointer-events-none"
        />
      </div>

      {/* Draggable Handle and Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)] pointer-events-none z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0b0b12] border border-violet-500 rounded-full flex items-center justify-center shadow-xl text-violet-300">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
      </div>

      {/* Invisible Interactive Range Input */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        aria-label="Image comparison slider"
      />
      
      {/* UI Badges (Visible on Hover) */}
      <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-black/75 border border-white/10 backdrop-blur-md rounded text-[10px] font-mono tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        BEFORE (RAW)
      </div>
      <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-black/75 border border-white/10 backdrop-blur-md rounded text-[10px] font-mono tracking-widest text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        AFTER (GRADED)
      </div>
    </div>
  );
};