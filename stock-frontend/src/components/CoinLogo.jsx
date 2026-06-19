import { useState } from 'react';

// Custom SVG Icons for meme/custom coins
const CUSTOM_SVGS = {
  XAU: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#F5B041" />
          <stop offset="100%" stopColor="#9A7D0A" />
        </linearGradient>
      </defs>
      {/* Gold bar 1 */}
      <path d="M4 14.5L6 7H14L12 14.5H4Z" fill="url(#gold-grad)" />
      <path d="M12 14.5L14 7L16.5 10.5L14.5 18H12V14.5Z" fill="#B7950B" opacity="0.8" />
      {/* Gold bar 2 */}
      <path d="M10 19L11.5 13.5H19.5L18 19H10Z" fill="url(#gold-grad)" />
    </svg>
  ),
  BULL: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6C4 6 6 3 12 3C18 3 20 6 20 6C20 6 18 8 18 11C18 14 16 16 12 18C8 16 6 14 6 11C6 8 4 6 4 6Z" fill="#10B981" opacity="0.3" />
      {/* Horns */}
      <path d="M3 7C5 7 7 4 10 4C7.5 7 8 11 8 11C8 11 5 10 3 7Z" fill="#059669" />
      <path d="M21 7C19 7 17 4 14 4C16.5 7 16 11 16 11C16 11 19 10 21 7Z" fill="#059669" />
      {/* Nose/Ring */}
      <circle cx="12" cy="15" r="3" stroke="#FBBF24" strokeWidth="2" fill="#111827" />
    </svg>
  ),
  DEGEN: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="degen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="12" fill="url(#degen-grad)" opacity="0.2" />
      {/* Thug Life Glasses */}
      <path d="M2 9H9V12H7V13H5V12H2V9Z" fill="#111827" />
      <path d="M15 9H22V12H20V13H18V12H15V9Z" fill="#111827" />
      <rect x="9" y="10" width="6" height="1" fill="#111827" />
      {/* White gloss on sunglasses */}
      <rect x="3" y="10" width="2" height="1" fill="#FFF" />
      <rect x="16" y="10" width="2" height="1" fill="#FFF" />
    </svg>
  ),
  BSO: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="7" fill="#3B82F6" />
      <ellipse cx="12" cy="12" rx="11" ry="3" stroke="#60A5FA" strokeWidth="2" transform="rotate(-30 12 12)" />
      <circle cx="12" cy="12" r="3" fill="#93C5FD" />
    </svg>
  ),
  UP: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L19 9H15V17H9V9H5L12 2Z" fill="#10B981" />
      <path d="M5 20H19V22H5V20Z" fill="#059669" />
      {/* Flame */}
      <path d="M10 18L12 21L14 18H10Z" fill="#EF4444" />
    </svg>
  ),
  ESPORTS: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#1E293B" />
      {/* Game Controller */}
      <rect x="4" y="8" width="16" height="9" rx="3" fill="#475569" />
      {/* D-Pad */}
      <path d="M7 11H9V14H7V11ZM6 12H10V13H6V12Z" fill="#06B6D4" />
      {/* Buttons */}
      <circle cx="15" cy="11.5" r="1" fill="#EC4899" />
      <circle cx="17" cy="13.5" r="1" fill="#EC4899" />
    </svg>
  ),
  VIRL: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#EF4444" opacity="0.2" />
      <circle cx="12" cy="12" r="4" fill="#EF4444" />
      {/* Spikes */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="#EF4444" strokeWidth="2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#EF4444" strokeWidth="2" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#EF4444" strokeWidth="2" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" stroke="#EF4444" strokeWidth="2" />
    </svg>
  ),
  RTX: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#111827" />
      <path d="M6 6H18V18H6V6Z" fill="#22C55E" opacity="0.15" />
      {/* Chip traces */}
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="#22C55E" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="9" stroke="#22C55E" strokeWidth="1.5" />
      <line x1="12" y1="15" x2="12" y2="18" stroke="#22C55E" strokeWidth="1.5" />
      <line x1="6" y1="12" x2="9" y2="12" stroke="#22C55E" strokeWidth="1.5" />
      <line x1="15" y1="12" x2="18" y2="12" stroke="#22C55E" strokeWidth="1.5" />
    </svg>
  ),
  BABYTROLL: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="14" r="7" fill="#F472B6" />
      {/* Troll Hair */}
      <path d="M12 2C12 2 9 6 9 8C9 10 12 11 12 11C12 11 15 10 15 8C15 6 12 2 12 2Z" fill="#3B82F6" />
      <circle cx="9.5" cy="13" r="1" fill="#fff" />
      <circle cx="14.5" cy="13" r="1" fill="#fff" />
      <path d="M10 16.5C11 17.5 13 17.5 14 16.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  EITHER: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L18 12L12 15L6 12L12 2Z" fill="#A78BFA" />
      <path d="M12 16L18 13L12 22L6 13L12 16Z" fill="#7C3AED" />
    </svg>
  ),
  SKYAI: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14C4.34 14 3 12.66 3 11C3 9.64 3.9 8.5 5.14 8.17C5.6 6.36 7.23 5 9.2 5C11.38 5 13.21 6.55 13.56 8.61C14.07 8.22 14.7 8 15.38 8C16.83 8 18 9.17 18 10.62C18 10.87 17.96 11.12 17.89 11.35C19.1 12.08 20 13.43 20 15C20 17.21 18.21 19 16 19H7C4.79 19 3 17.21 3 15C3 14.57 3.07 14.16 3.2 13.78" fill="#0EA5E9" opacity="0.3" />
      {/* AI node */}
      <circle cx="12" cy="12" r="3" fill="#38BDF8" />
      <circle cx="7" cy="15" r="1.5" fill="#38BDF8" />
      <circle cx="17" cy="15" r="1.5" fill="#38BDF8" />
      <circle cx="12" cy="7" r="1.5" fill="#38BDF8" />
      <line x1="12" y1="9" x2="12" y2="12" stroke="#38BDF8" strokeWidth="1" />
      <line x1="7.9" y1="14.1" x2="10.5" y2="12.5" stroke="#38BDF8" strokeWidth="1" />
      <line x1="16.1" y1="14.1" x2="13.5" y2="12.5" stroke="#38BDF8" strokeWidth="1" />
    </svg>
  ),
  SPCX: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#475569" strokeWidth="1" />
      {/* Orbit */}
      <ellipse cx="12" cy="12" rx="11" ry="4" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(-15 12 12)" />
      {/* Rocket */}
      <path d="M16 7L18 5L19 6L17 8H16V7Z" fill="#FFF" />
      <circle cx="12" cy="12" r="4" fill="#1E293B" />
    </svg>
  ),
  TITAN: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="2" fill="#334155" />
      {/* Shield emblem */}
      <path d="M12 6L16 9V13C16 16 14 18 12 19C10 18 8 16 8 13V9L12 6Z" fill="#F59E0B" />
    </svg>
  ),
  WORLDCUP: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4H18V10C18 13.31 15.31 16 12 16C8.69 16 6 13.31 6 10V4Z" fill="#FBBF24" />
      {/* Base */}
      <rect x="9" y="19" width="6" height="3" rx="1" fill="#D97706" />
      <rect x="11" y="16" width="2" height="3" fill="#D97706" />
      {/* Handles */}
      <path d="M4 6C4 6 2 8 4 11" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 6C20 6 22 8 20 11" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  sato: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sato-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#sato-grad)" />
      {/* Stylized 'S' inside circle */}
      <path d="M9 16C9 16 10 17.5 12 17.5C14 17.5 15 16 15 14.5C15 12.5 12 12.5 12 11.5C12 10.5 13.5 10.5 14 11" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 8C15 8 14 6.5 12 6.5C10 6.5 9 8 9 9.5C9 11.5 12 11.5 12 12.5C12 13.5 10.5 13.5 10 13" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  Goblin: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#065F46" opacity="0.3" />
      {/* Ears */}
      <path d="M2 10C2 10 5 12 8 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 10C22 10 19 12 16 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      {/* Face */}
      <circle cx="12" cy="13" r="5" fill="#10B981" />
      {/* Eyes */}
      <circle cx="10" cy="12" r="1" fill="#FFF" />
      <circle cx="14" cy="12" r="1" fill="#FFF" />
    </svg>
  ),
  AWF: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#334155" opacity="0.4" />
      {/* Wolf Profile */}
      <path d="M8 18C10 16 11 13 11 10C11 7 9 5 9 5C9 5 12 6 13 8C14 7 15 5 15 5C15 5 15 7 14 10C15.5 11 17 13 18 15" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  RAGEGUY: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#FFF" strokeWidth="1.5" fill="#EF4444" opacity="0.1" />
      {/* Angry face sketch */}
      <path d="M7 9C8 10 9 10 10 9" stroke="#FFF" strokeWidth="1.5" />
      <path d="M14 9C15 10 16 10 17 9" stroke="#FFF" strokeWidth="1.5" />
      <path d="M8 8L10 9.5" stroke="#FFF" strokeWidth="1.5" />
      <path d="M16 8L14 9.5" stroke="#FFF" strokeWidth="1.5" />
      <circle cx="12" cy="15" r="2" stroke="#FFF" strokeWidth="1.5" />
    </svg>
  ),
  HANTA: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2.5" />
      <path d="M12 6V13" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.25" fill="#EF4444" />
    </svg>
  ),
  BURNIE: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 15 6 15 9C15 12.31 12.31 15 9 15C5.69 15 5 12 5 9C5 6 12 2 12 2Z" fill="url(#fire-grad)" />
      <path d="M12 7C12 7 14 9 14 11C14 13.21 12.21 15 10 15C7.79 15 7 13 7 11C7 9 12 7 12 7Z" fill="#FCD535" />
    </svg>
  ),
  USDUC: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#2563EB" />
      <circle cx="12" cy="12" r="8" stroke="#FFF" strokeWidth="1.5" />
      <text x="12" y="16" fill="#FFF" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
    </svg>
  ),
  ASTEROID: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Meteor trail */}
      <path d="M4 4L12 12L10 13L2 5L4 4Z" fill="#F97316" opacity="0.6" />
      <circle cx="14" cy="14" r="6" fill="#64748B" />
      <circle cx="12" cy="12" r="1.5" fill="#475569" />
      <circle cx="16" cy="15" r="1.5" fill="#475569" />
    </svg>
  ),
  PAYAI: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="#4F46E5" />
      <circle cx="8" cy="12" r="2.5" fill="#10B981" />
      {/* Sparkles */}
      <path d="M15 10L16 12L18 13L16 14L15 16L14 14L12 13L14 12L15 10Z" fill="#FFF" />
    </svg>
  ),
};

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const CoinLogo = ({ name, size = 28 }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const symbol = name ? name.toUpperCase() : '';

  if (!symbol) return null;

  // If there's a custom high-quality SVG defined for this specific symbol, render it immediately
  if (CUSTOM_SVGS[symbol]) {
    return (
      <div style={{ 
        position: 'relative', 
        width: `${size}px`, 
        height: `${size}px`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: '8px',
        flexShrink: 0
      }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', borderRadius: '50%', overflow: 'hidden' }}>
          {CUSTOM_SVGS[symbol]}
        </div>
      </div>
    );
  }

  const sources = [
    `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`
  ];

  const handleErr = (e) => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      e.currentTarget.style.display = 'none';
      const fallback = e.currentTarget.nextSibling;
      if (fallback) fallback.style.display = 'flex';
    }
  };

  const hash = hashStr(symbol);
  const h1 = hash % 360;
  const h2 = (h1 + 40) % 360;
  const bgGradient = `linear-gradient(135deg, hsl(${h1}, 80%, 45%), hsl(${h2}, 85%, 25%))`;
  const shadowColor = `hsla(${h1}, 80%, 50%, 0.35)`;

  return (
    <div style={{ 
      position: 'relative', 
      width: `${size}px`, 
      height: `${size}px`, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginRight: '8px',
      flexShrink: 0
    }}>
      <img 
        src={sources[srcIndex]}
        onError={handleErr}
        onLoad={(e) => {
          e.currentTarget.style.display = 'block';
          const fallback = e.currentTarget.nextSibling;
          if (fallback) fallback.style.display = 'none';
        }}
        alt={symbol}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%', 
          display: 'none', 
          objectFit: 'cover',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      />
      <div 
        className="alpha-coin-icon" 
        style={{
          background: bgGradient,
          color: '#fff',
          display: 'flex',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: size < 20 ? '8px' : size < 30 ? '11px' : '13px',
          boxShadow: `0 3px 8px ${shadowColor}, inset 0 1px 2px rgba(255,255,255,0.45), inset 0 -1.5px 2px rgba(0,0,0,0.45)`,
          textShadow: '0 1px 1px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          textTransform: 'uppercase',
          margin: 0
        }}
      >
        {symbol.slice(0, 2)}
      </div>
    </div>
  );
};

export default CoinLogo;
