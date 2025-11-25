'use client';

import { useState } from 'react';

interface EducationalTooltipProps {
  title: string;
  content: string;
  trigger?: 'hover' | 'click';
}

export default function EducationalTooltip({
  title,
  content,
  trigger = 'hover'
}: EducationalTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label={title}
      >
        ⓘ
      </button>

      {isVisible && (
        <div
          className="absolute z-50 w-80 p-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(100% + 8px)',
          }}
        >
          {/* Arrow pointing down */}
          <div
            className="absolute w-3 h-3 bg-gray-900 border-r border-b border-gray-700 transform rotate-45"
            style={{
              left: '50%',
              marginLeft: '-6px',
              bottom: '-6px',
            }}
          />

          {/* Content */}
          <div className="relative">
            <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
