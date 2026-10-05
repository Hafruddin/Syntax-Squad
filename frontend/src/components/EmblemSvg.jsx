import React from 'react';

export default function EmblemSvg({ className = "emblem-svg" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Military Shield Base */}
      <path d="M50 4L12 20V50C12 74 50 96 50 96C50 96 88 74 88 50V20L50 4Z" fill="#002f56" stroke="#ff9933" strokeWidth="2.5" />
      {/* Inner Tricolor Laurel */}
      <path d="M50 12L20 25V48C20 68 50 86 50 86C50 86 80 68 80 48V25L50 12Z" fill="#ffffff" />
      {/* Crossed Sabres & Ashoka Dharma Chakra */}
      <circle cx="50" cy="46" r="16" stroke="#005a9c" strokeWidth="2.5" fill="#f8fafc" />
      {/* 24 Spokes representation */}
      <circle cx="50" cy="46" r="3" fill="#005a9c" />
      <line x1="50" y1="30" x2="50" y2="62" stroke="#005a9c" strokeWidth="1.5" />
      <line x1="34" y1="46" x2="66" y2="46" stroke="#005a9c" strokeWidth="1.5" />
      <line x1="38.7" y1="34.7" x2="61.3" y2="57.3" stroke="#005a9c" strokeWidth="1.5" />
      <line x1="38.7" y1="57.3" x2="61.3" y2="34.7" stroke="#005a9c" strokeWidth="1.5" />
      {/* Crossed Swords / Star representation */}
      <path d="M28 72L42 58M72 72L58 58" stroke="#d9381e" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 68L50 78" stroke="#138808" strokeWidth="3" strokeLinecap="round" />
      {/* Banner base text representation */}
      <path d="M30 84C42 87 58 87 70 84" stroke="#ff9933" strokeWidth="2" />
    </svg>
  );
}
