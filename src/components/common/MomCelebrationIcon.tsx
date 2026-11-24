import React from 'react';

export interface MomCelebrationIconProps {
  className?: string;
}

export const MomCelebrationIcon: React.FC<MomCelebrationIconProps> = ({
  className = 'w-28 h-28',
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} select-none`}
      role="img"
      aria-label="Mom v7.0 Celebration Emblem"
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="emblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="45%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Gold crown & ribbon gradient */}
        <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Cake frosting gradient */}
        <linearGradient id="emblemFrosting" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>

        {/* Flame glow */}
        <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main squircle badge */}
      <rect width="120" height="120" rx="30" fill="url(#emblemBg)" />

      {/* Decorative white/gold border ring */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeOpacity="0.45"
      />

      {/* Soft background radial shine */}
      <circle cx="60" cy="30" r="38" fill="#ffffff" opacity="0.12" />

      {/* 1. Golden Queen's Crown on top */}
      <g filter="url(#flameGlow)">
        <path
          d="M44 23 L49 13 L60 20 L71 13 L76 23 L73 28 L47 28 Z"
          fill="url(#emblemGold)"
        />
        {/* Pearls on crown tips */}
        <circle cx="49" cy="12" r="2.2" fill="#ffffff" />
        <circle cx="60" cy="19" r="2.5" fill="#ffffff" />
        <circle cx="71" cy="12" r="2.2" fill="#ffffff" />
        {/* Ruby gem in center */}
        <circle cx="60" cy="25" r="2" fill="#ef4444" />
      </g>

      {/* 2. Candles on cake */}
      {/* Left candle */}
      <rect x="42" y="38" width="4" height="12" rx="2" fill="#38bdf8" />
      <path
        d="M44 32 Q46 35 44 38 Q42 35 44 32 Z"
        fill="#facc15"
      />
      {/* Center main golden candle */}
      <rect x="58" y="34" width="4" height="16" rx="2" fill="#f43f5e" />
      <path
        d="M60 27 Q62.5 31 60 34 Q57.5 31 60 27 Z"
        fill="#fef08a"
      />
      {/* Right candle */}
      <rect x="74" y="38" width="4" height="12" rx="2" fill="#38bdf8" />
      <path
        d="M76 32 Q78 35 76 38 Q74 35 76 32 Z"
        fill="#facc15"
      />

      {/* 3. Birthday Cake Body */}
      {/* Top tier */}
      <rect
        x="36"
        y="50"
        width="48"
        height="16"
        rx="5"
        fill="url(#emblemFrosting)"
        stroke="#fbcfe8"
        strokeWidth="1.5"
      />
      {/* Frosting scalloped drip on top tier */}
      <path
        d="M36 54 Q40 58 44 54 Q48 58 52 54 Q56 58 60 54 Q64 58 68 54 Q72 58 76 54 Q80 58 84 54"
        stroke="#e11d48"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom tier with big celebratory '70' */}
      <rect
        x="24"
        y="64"
        width="72"
        height="26"
        rx="6"
        fill="url(#emblemFrosting)"
        stroke="#fbcfe8"
        strokeWidth="1.5"
      />
      <path
        d="M24 69 Q30 75 36 69 Q42 75 48 69 Q54 75 60 69 Q66 75 72 69 Q78 75 84 69 Q90 75 96 69"
        stroke="#e11d48"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gold & Ruby 70 in center of cake */}
      <text
        x="60"
        y="85"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="19"
        fill="#be123c"
        letterSpacing="-0.5"
      >
        70
      </text>

      {/* 4. Golden Ribbon Banner for 'Mom v7.0' */}
      <g filter="url(#flameGlow)">
        <rect
          x="18"
          y="92"
          width="84"
          height="20"
          rx="10"
          fill="url(#emblemGold)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <text
          x="60"
          y="106"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="11.5"
          fill="#78350f"
          letterSpacing="1"
        >
          MOM v7.0
        </text>
      </g>

      {/* 5. Festive Sparkles on corners */}
      <path
        d="M14 36 L16 40 L20 41.5 L16 43 L14 47 L12 43 L8 41.5 L12 40 Z"
        fill="#fef08a"
        opacity="0.9"
      />
      <path
        d="M106 36 L108 40 L112 41.5 L108 43 L106 47 L104 43 L100 41.5 L104 40 Z"
        fill="#fef08a"
        opacity="0.9"
      />
      <circle cx="20" cy="20" r="1.8" fill="#ffffff" opacity="0.8" />
      <circle cx="100" cy="20" r="1.8" fill="#ffffff" opacity="0.8" />
      <circle cx="12" cy="74" r="1.5" fill="#ffffff" opacity="0.7" />
      <circle cx="108" cy="74" r="1.5" fill="#ffffff" opacity="0.7" />
    </svg>
  );
};
