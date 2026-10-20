import fs from 'fs';
import path from 'path';

// 1. Symbol Only (256x256) - Dark Navy + Gold & Azure
const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D1B5" />
      <stop offset="50%" stop-color="#C5A880" />
      <stop offset="100%" stop-color="#9E7E52" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D5BFF" />
      <stop offset="100%" stop-color="#171E52" />
    </linearGradient>
    <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E2768" />
      <stop offset="100%" stop-color="#0F1155" />
    </linearGradient>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#C5A880" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Luxury Badge Base (Squircle) -->
  <rect x="8" y="8" width="240" height="240" rx="56" fill="url(#badgeBg)" stroke="#C5A880" stroke-opacity="0.35" stroke-width="3" />

  <!-- Inner Refined Gold Border Ring -->
  <rect x="20" y="20" width="216" height="216" rx="46" fill="none" stroke="#C5A880" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="4 2" />

  <!-- Iconic Accor / Novotel Dynamic Flight Arc (Swoosh) -->
  <path d="M 44 186 C 82 174, 150 144, 208 72 C 172 104, 114 136, 56 160 C 48 164, 42 176, 44 186 Z" fill="url(#goldGrad)" filter="url(#subtleGlow)" />

  <!-- Architectural 'N' Monogram -->
  <!-- Left Pillar -->
  <path d="M 66 76 L 94 76 L 94 180 L 66 180 Z" fill="#FFFFFF" fill-opacity="0.95" />
  
  <!-- Right Pillar -->
  <path d="M 162 76 L 190 76 L 190 180 L 162 180 Z" fill="#FFFFFF" fill-opacity="0.95" />
  
  <!-- Central Dynamic Diagonal with Precision Bevel -->
  <path d="M 94 76 L 162 166 L 162 180 L 134 180 L 66 90 L 66 76 Z" fill="url(#goldGrad)" />

  <!-- Top Horizon Accent Jewel -->
  <circle cx="128" cy="46" r="4.5" fill="#C5A880" />
</svg>`;

// 2. Pure Gold Symbol (for Keycards, Stamps, Favicons)
const symbolGoldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none">
  <defs>
    <linearGradient id="pureGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2E3D0" />
      <stop offset="45%" stop-color="#C5A880" />
      <stop offset="100%" stop-color="#9A7B4F" />
    </linearGradient>
  </defs>
  <!-- Accor Dynamic Flight Arc -->
  <path d="M 40 186 C 80 172, 152 140, 214 68 C 174 102, 112 136, 54 160 C 46 164, 38 176, 40 186 Z" fill="url(#pureGold)" />

  <!-- Geometric 'N' -->
  <path d="M 64 74 L 92 74 L 92 182 L 64 182 Z" fill="url(#pureGold)" fill-opacity="0.85" />
  <path d="M 164 74 L 192 74 L 192 182 L 164 182 Z" fill="url(#pureGold)" fill-opacity="0.85" />
  <path d="M 92 74 L 164 168 L 164 182 L 136 182 L 64 88 L 64 74 Z" fill="url(#pureGold)" />
  <circle cx="128" cy="44" r="5" fill="url(#pureGold)" />
</svg>`;

// 3. Full Horizontal Brand Lockup (NOVOTEL PULSE CONCIERGE) (600x120)
const logoHorizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="600" height="120" fill="none">
  <defs>
    <linearGradient id="hGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EEDAC4" />
      <stop offset="50%" stop-color="#C5A880" />
      <stop offset="100%" stop-color="#A08055" />
    </linearGradient>
    <linearGradient id="hBadge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A225B" />
      <stop offset="100%" stop-color="#0E123D" />
    </linearGradient>
  </defs>

  <!-- Left Symbol Badge (84x84) -->
  <g transform="translate(16, 18)">
    <rect x="0" y="0" width="84" height="84" rx="20" fill="url(#hBadge)" stroke="#C5A880" stroke-opacity="0.4" stroke-width="1.5" />
    <!-- Dynamic Swoosh -->
    <path d="M 16 64 C 28 60, 52 50, 72 26 C 58 38, 38 48, 18 56 C 15 58, 13 62, 16 64 Z" fill="url(#hGold)" />
    <!-- 'N' Monogram -->
    <path d="M 24 26 L 33 26 L 33 60 L 24 60 Z" fill="#FFFFFF" />
    <path d="M 53 26 L 62 26 L 62 60 L 53 60 Z" fill="#FFFFFF" />
    <path d="M 33 26 L 54 55 L 54 60 L 45 60 L 24 31 L 24 26 Z" fill="url(#hGold)" />
    <circle cx="42" cy="17" r="2.2" fill="#C5A880" />
  </g>

  <!-- Brand Typography -->
  <!-- "NOVOTEL" Primary Brand Title -->
  <text x="124" y="60" font-family="'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="36" font-weight="800" letter-spacing="4" fill="#FFFFFF">NOVOTEL</text>

  <!-- "PULSE" Sub-brand in Gold -->
  <text x="354" y="60" font-family="'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="36" font-weight="300" letter-spacing="3" fill="url(#hGold)">PULSE</text>

  <!-- Divider Line -->
  <line x1="124" y1="74" x2="480" y2="74" stroke="#C5A880" stroke-opacity="0.3" stroke-width="1" />

  <!-- Subtitle: CONCIERGE & OPERATIONS • ACCOR -->
  <text x="125" y="92" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="3" fill="#C5A880" fill-opacity="0.9">CONCIERGE &amp; RESIDENCE • ACCOR</text>
</svg>`;

// 4. Favicon (64x64)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <defs>
    <linearGradient id="favGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EEDAC4" />
      <stop offset="100%" stop-color="#C5A880" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#171E52" />
  <!-- Swoosh -->
  <path d="M 12 48 C 22 45, 38 38, 52 18 C 42 28, 28 36, 14 42 C 12 43, 10 46, 12 48 Z" fill="url(#favGold)" />
  <!-- 'N' -->
  <path d="M 18 20 L 25 20 L 25 46 L 18 46 Z" fill="#FFFFFF" />
  <path d="M 40 20 L 47 20 L 47 46 L 40 46 Z" fill="#FFFFFF" />
  <path d="M 25 20 L 41 42 L 41 46 L 34 46 L 18 24 L 18 20 Z" fill="url(#favGold)" />
</svg>`;

fs.writeFileSync('public/novotel-symbol.svg', symbolSvg);
fs.writeFileSync('public/novotel-symbol-gold.svg', symbolGoldSvg);
fs.writeFileSync('public/novotel-logo.svg', logoHorizontalSvg);
fs.writeFileSync('public/favicon.svg', faviconSvg);

console.log('✓ All 4 Novotel SVG brand assets generated in public/');
