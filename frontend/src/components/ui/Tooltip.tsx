import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 whitespace-nowrap px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded shadow-sm ${positionClasses[position]}`}>
          {content}
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45"
            style={{
              ...(position === 'top' ? { bottom: '-4px', left: 'calc(50% - 4px)' } : {}),
              ...(position === 'bottom' ? { top: '-4px', left: 'calc(50% - 4px)' } : {}),
              ...(position === 'left' ? { right: '-4px', top: 'calc(50% - 4px)' } : {}),
              ...(position === 'right' ? { left: '-4px', top: 'calc(50% - 4px)' } : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}
