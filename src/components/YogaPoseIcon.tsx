

interface YogaPoseIconProps {
  className?: string;
}

export function YogaPoseIcon({ className = "" }: YogaPoseIconProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle
        cx="100"
        cy="45"
        r="18"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Body */}
      <path
        d="M100 65 L100 120"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Arms in meditation pose */}
      <path
        d="M100 80 Q85 75 75 85 Q70 90 75 95 Q85 100 95 95 L100 90"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      <path
        d="M100 80 Q115 75 125 85 Q130 90 125 95 Q115 100 105 95 L100 90"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Legs in lotus position */}
      <path
        d="M100 120 Q85 125 70 130 Q55 135 55 145 Q55 150 65 150 Q80 145 90 140"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      <path
        d="M100 120 Q115 125 130 130 Q145 135 145 145 Q145 150 135 150 Q120 145 110 140"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Base/sitting surface indication */}
      <ellipse
        cx="100"
        cy="150"
        rx="50"
        ry="8"
        fill="currentColor"
        fillOpacity="0.05"
      />
    </svg>
  );
}