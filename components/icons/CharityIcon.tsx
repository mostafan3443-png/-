import React from 'react';

const CharityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_charity_logo_final)">
      {/* Background */}
      <rect width="100" height="100" rx="10" fill="#4A5568"/>

      {/* Sun */}
      <circle cx="50" cy="45" r="28" fill="#FBBF24" opacity="0.8"/>
      {[...Array(16)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="45"
          x2="50"
          y2="0"
          stroke="#FBBF24"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${i * (360 / 16)}, 50, 45)`}
        />
      ))}
      <circle cx="50" cy="45" r="20" fill="#FBBF24"/>
      
      {/* Hands */}
      <path 
        d="M25,95 C30,80 40,75 50,75 C60,75 70,80 75,95 L25,95 Z" 
        fill="#A0AEC0"
      />
      <path 
        d="M70 55 C 60 65, 50 68, 45 80 C 50 70, 60 65, 75 50 Z" 
        fill="#EDF2F7"
      />

    </g>
    <defs>
      <clipPath id="clip0_charity_logo_final">
        <rect width="100" height="100" rx="10"/>
      </clipPath>
    </defs>
  </svg>
);

export default CharityIcon;
