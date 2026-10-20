'use client';

import React from 'react';

interface NovotelLogoProps {
  variant?: 'symbol' | 'horizontal' | 'badge' | 'wordmark' | 'gold-seal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'gold';
  subtitle?: string;
  className?: string;
}

export default function NovotelLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'dark',
  subtitle,
  className = '',
}: NovotelLogoProps) {
  // Dimensions map
  const symbolSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const horizontalHeights = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  // 1. PURE SYMBOL / EMBLEM
  if (variant === 'symbol' || variant === 'badge') {
    const isBadge = variant === 'badge';
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${symbolSizes[size]} ${className}`}>
        <svg 
          viewBox="0 0 256 256" 
          className="w-full h-full drop-shadow-sm select-none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nvGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#EEDAC4" />
              <stop offset="50%" stop-color="#C5A880" />
              <stop offset="100%" stop-color="#9E7E52" />
            </linearGradient>
            <linearGradient id="nvBadgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1E2768" />
              <stop offset="100%" stop-color="#0F1155" />
            </linearGradient>
            <filter id="nvGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#C5A880" flood-opacity="0.3" />
            </filter>
          </defs>

          {/* Squircle Badge Background */}
          {isBadge && (
            <>
              <rect 
                x="8" y="8" width="240" height="240" rx="56" 
                fill={theme === 'light' ? '#FFFFFF' : 'url(#nvBadgeBg)'} 
                stroke="#C5A880" 
                stroke-opacity={theme === 'light' ? '0.25' : '0.4'} 
                stroke-width="3" 
              />
              <rect 
                x="20" y="20" width="216" height="216" rx="46" 
                fill="none" 
                stroke="#C5A880" 
                stroke-opacity="0.2" 
                stroke-width="1.5" 
                stroke-dasharray="4 3" 
              />
            </>
          )}

          {/* Dynamic Accor Flight Arc */}
          <path 
            d="M 44 186 C 82 174, 150 144, 208 72 C 172 104, 114 136, 56 160 C 48 164, 42 176, 44 186 Z" 
            fill="url(#nvGoldGrad)" 
            filter="url(#nvGlow)" 
          />

          {/* Geometric 'N' Monogram */}
          <path 
            d="M 66 76 L 94 76 L 94 180 L 66 180 Z" 
            fill={theme === 'light' ? '#171E52' : '#FFFFFF'} 
            fillOpacity={theme === 'gold' ? '0.85' : '0.95'} 
          />
          <path 
            d="M 162 76 L 190 76 L 190 180 L 162 180 Z" 
            fill={theme === 'light' ? '#171E52' : '#FFFFFF'} 
            fillOpacity={theme === 'gold' ? '0.85' : '0.95'} 
          />
          <path 
            d="M 94 76 L 162 166 L 162 180 L 134 180 L 66 90 L 66 76 Z" 
            fill="url(#nvGoldGrad)" 
          />

          {/* Crown Celestial Orb */}
          <circle cx="128" cy="46" r="4.5" fill="#C5A880" />
        </svg>
      </div>
    );
  }

  // 2. METALLIC GOLD SEAL (for Keycards, Luxury Stamped Cards)
  if (variant === 'gold-seal') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${symbolSizes[size]} ${className}`}>
        <svg 
          viewBox="0 0 256 256" 
          className="w-full h-full drop-shadow-md select-none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF3E0" />
              <stop offset="35%" stop-color="#D4AF37" />
              <stop offset="70%" stop-color="#C5A880" />
              <stop offset="100%" stop-color="#8C6830" />
            </linearGradient>
            <radialGradient id="foilShine" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Ring with Bevel Effect */}
          <circle cx="128" cy="128" r="118" stroke="url(#sealGold)" stroke-width="4" fill="none" opacity="0.8" />
          <circle cx="128" cy="128" r="108" stroke="url(#sealGold)" stroke-width="1.5" stroke-dasharray="3 3" fill="none" opacity="0.6" />
          <circle cx="128" cy="128" r="104" fill="url(#foilShine)" />

          {/* Flight Swoosh */}
          <path 
            d="M 46 182 C 84 170, 150 140, 206 72 C 170 102, 114 134, 58 158 C 50 162, 44 172, 46 182 Z" 
            fill="url(#sealGold)" 
          />

          {/* Monogram 'N' */}
          <path d="M 68 76 L 94 76 L 94 180 L 68 180 Z" fill="url(#sealGold)" fillOpacity="0.8" />
          <path d="M 162 76 L 188 76 L 188 180 L 162 180 Z" fill="url(#sealGold)" fillOpacity="0.8" />
          <path d="M 94 76 L 162 166 L 162 180 L 136 180 L 68 90 L 68 76 Z" fill="url(#sealGold)" />
          
          <circle cx="128" cy="46" r="4.5" fill="url(#sealGold)" />
        </svg>
      </div>
    );
  }

  // 3. FULL HORIZONTAL BRAND LOCKUP
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${horizontalHeights[size]} ${className}`}>
      {/* Brand Monogram Badge */}
      <NovotelLogo 
        variant="badge" 
        size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} 
        theme={theme} 
      />

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span 
            className={`font-extrabold tracking-[0.16em] uppercase transition-colors ${
              theme === 'light' ? 'text-[#171E52]' : theme === 'gold' ? 'text-[#C5A880]' : 'text-white'
            } ${
              size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl'
            }`}
            style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            NOVOTEL
          </span>
          <span 
            className={`font-light tracking-[0.12em] uppercase text-[#C5A880] ${
              size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
            }`}
            style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            PULSE
          </span>
        </div>

        {/* Sub-label / Tagline */}
        <span 
          className={`tracking-[0.2em] font-semibold uppercase text-[#C5A880]/80 mt-0.5 ${
            size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[9px]' : 'text-[11px]'
          }`}
        >
          {subtitle || 'CONCIERGE • ACCOR'}
        </span>
      </div>
    </div>
  );
}
