import React from 'react';

interface MeditationIconProps {
  className?: string;
}

export const MeditationIcon: React.FC<MeditationIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Head */}
        <circle cx="50" cy="25" r="8" />
        
        {/* Heart/chest area */}
        <path d="M42 45 Q50 38 58 45 Q50 52 42 45" />
        
        {/* Body in meditation pose */}
        <path d="M50 35 L50 55" />
        
        {/* Legs in lotus position */}
        <path d="M35 65 Q42 55 50 55 Q58 55 65 65" />
        <path d="M35 65 Q42 70 50 65 Q58 70 65 65" />
        
        {/* Arms in meditation position */}
        <path d="M42 45 Q35 50 35 55" />
        <path d="M58 45 Q65 50 65 55" />
      </g>
    </svg>
  );
};