const fs = require('fs');
const path = require('path');

const globalSkillsDir = path.join(process.env.USERPROFILE, '.gemini', 'config', 'skills');
const workspaceSkillsDir = path.join(__dirname, '..', '.agents', 'skills');
const tempDir = path.join(__dirname, '..', '.temp_skills');

function installSkill(skillName, skillContent) {
  const gDir = path.join(globalSkillsDir, skillName);
  const wDir = path.join(workspaceSkillsDir, skillName);
  fs.mkdirSync(gDir, { recursive: true });
  fs.mkdirSync(wDir, { recursive: true });
  fs.writeFileSync(path.join(gDir, 'SKILL.md'), skillContent, 'utf8');
  fs.writeFileSync(path.join(wDir, 'SKILL.md'), skillContent, 'utf8');
  console.log('Successfully installed skill:', skillName);
}

// 1. Direct SKILL.md files from GitHub repositories
const directSkills = [
  { dir: 'logo-design', name: 'logo-design' },
  { dir: 'scroll-craft', name: 'scroll-craft' },
  { dir: 'ponytail', name: 'ponytail' },
  { dir: 'gauntlet-loop', name: 'gauntlet-loop' },
  { dir: 'wacli', name: 'wacli' },
  { dir: 'brag', name: 'brag' },
  { dir: 'cro', name: 'cro' },
  { dir: 'copywriting', name: 'copywriting' },
  { dir: 'seo', name: 'seo' }
];

for (const s of directSkills) {
  const p = path.join(tempDir, s.dir, 'SKILL.md');
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    installSkill(s.name, content);
  }
}

// 2. stickman-video
const stickmanP = path.join(tempDir, 'stickman-video', 'SOURCE.md');
if (fs.existsSync(stickmanP)) {
  installSkill('directing-stickman-videos', fs.readFileSync(stickmanP, 'utf8'));
}

// 3. react-bits
const reactBitsSkill = `---
name: react-bits
description: Use when building animated, interactive, physics-based, or high-end UI components using React, Next.js, Tailwind CSS, and Framer Motion. Contains copy-paste implementations for text animations, 3D cards, cursor effects, magnets, particle backgrounds, and dock navigations.
---

# React Bits Component Library

React Bits is the largest open-source library of animated, interactive, and customizable React & Next.js components for building standout web products and experiences.

## Core Component Categories

### 1. Text & Typography Animations
- **BlurText**: Progressive letter/word blur revealing effect with spring physics.
- **SplitText**: Character-by-character or word-by-word staggered reveal.
- **ShinyText**: Shimmering metallic or glossy linear gradient sweep across text.
- **DecryptedText**: Hacker/cyberpunk character decrypting cycle until final text settles.
- **TrueFocus**: Interactive focus ring snapping to active or hovered words.
- **AsciiText**: Canvas-based real-time ASCII rendered typography.

### 2. Animations & Physics
- **Magnet**: Snaps elements toward cursor coordinates with magnetic dampening and elastic release.
- **ClickSpark**: Multi-particle burst emitted from cursor click coordinates.
- **SplashCursor**: High-fidelity fluid simulation trail that follows mouse movement.
- **BlobCursor**: Gooey SVG filter cursor trail with spring dynamics.
- **PixelTransition**: Grid-based pixel dissolve transition between two images or cards.

### 3. Cards & Surfaces
- **TiltedCard**: 3D parallax tilt responsive to mouse position with specular highlight overlay.
- **SpotlightCard**: Radial gradient spotlight following mouse position across dark surfaces.
- **Stack**: Draggable, swipeable interactive card stack with spring-back physics.
- **BounceCards**: Staggered floating cards with organic oscillation.

### 4. Backgrounds & Ambience
- **Hyperspeed**: 3D warp speed / starfield highway animation with Three.js.
- **Waves**: Smooth multi-wave sinusoidal canvas animation.
- **Iridescence**: Shifting chromatic oil-slick WebGL shader background.
- **Squares**: Interactive grid where tiles illuminate on mouse hover.
- **GridMotion**: Infinite dual-direction scrolling media grid.

## Implementation Guidelines

1. **Framework Integration**:
   - Supports React 18/19, Next.js App Router ('use client'), and Vanilla JS/Vite.
   - Pair with Tailwind CSS for utility styling and Framer Motion for springs.
2. **Performance Rules**:
   - Always honor \`prefers-reduced-motion\`.
   - Use CSS transforms (\`translate3d\`, \`scale\`) over layout-triggering properties.
   - Tear down WebGL/Canvas listeners on unmount.
`;
installSkill('react-bits', reactBitsSkill);

// 4. lenis-smooth-scroll
const lenisSkill = `---
name: lenis-smooth-scroll
description: Use when implementing smooth scrolling, momentum physics, scroll-jacking prevention, or syncing scroll position with GSAP ScrollTrigger, Three.js, and parallax elements.
---

# Lenis Smooth Scroll

Lenis is a lightweight, robust, and accessible smooth scroll library for the modern web by Studio Freight / Darkroom Engineering.

## Core Setup

\`\`\`javascript
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
\`\`\`

## GSAP ScrollTrigger Integration

Always synchronize Lenis with GSAP ScrollTrigger to ensure rock-solid scrubbed animations:

\`\`\`javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
\`\`\`

## Mobile & Touch Handling
- By default, touch scrolling is kept native on mobile devices (\`smoothTouch: false\`) to preserve native OS momentum and swipe gestures unless explicitly required.
- Use \`data-lenis-prevent\` on scrollable modal dialogs, drawers, or embedded iframes to prevent nested scroll trapping.
`;
installSkill('lenis-smooth-scroll', lenisSkill);

// 5. gsap-animation
const gsapSkill = `---
name: gsap-animation
description: Use when building advanced web animations, timeline orchestrations, scrubbed scroll triggers, SVG morphing, page transitions, and high-performance micro-interactions with GreenSock (GSAP).
---

# GSAP (GreenSock Animation Platform)

GSAP is the industry standard for robust, high-performance web animations trusted by Apple, Google, and top creative agencies.

## Core Principles

1. **Use Timelines for Sequences**: Avoid chaining multiple \`setTimeout\` or independent \`gsap.to\` calls. Group related animations into a \`gsap.timeline()\`.
2. **Zero Tap Lag & Performance**: Always animate hardware-accelerated properties: \`x\`, \`y\`, \`scale\`, \`rotation\`, \`opacity\`. Never animate \`top\`, \`left\`, \`margin\`, or \`width\` directly.
3. **Staggers**: Use \`stagger: { each: 0.05, from: 'start' }\` for fluid list items and letter reveals.

## Essential Code Patterns

### Master Timeline Orchestration
\`\`\`javascript
import gsap from 'gsap';

const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } });

tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.4 })
  .from('.hero-title', { opacity: 0, y: 30 }, '-=0.2')
  .from('.hero-card', { opacity: 0, scale: 0.95, stagger: 0.1 }, '-=0.3');
\`\`\`

### ScrollTrigger Scrub
\`\`\`javascript
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

gsap.to('.luxury-card', {
  scrollTrigger: {
    trigger: '.luxury-card',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1, // 1 second smoothing lag
  },
  y: -50,
  opacity: 1,
});
\`\`\`
`;
installSkill('gsap-animation', gsapSkill);

// 6. vanta-3d-backgrounds
const vantaSkill = `---
name: vanta-3d-backgrounds
description: Use when creating animated 3D WebGL / Three.js backgrounds such as waves, net, halo, clouds, birds, or topology for luxury landing pages, hero cards, or interactive showcases.
---

# Vanta.js 3D Backgrounds

Vanta.js provides lightweight, animated 3D WebGL canvas backgrounds powered by Three.js.

## Supported Effects
- **WAVES**: Fluid ocean / silk wave simulation (ideal for luxury concierge & hospitality).
- **NET**: Geometric node network connected by dynamic filaments.
- **HALO**: Chromatic luminous ring with ambient glow.
- **FOG & CLOUDS**: Atmospheric volumetric particle clouds.
- **GLOBE**: Interactive wireframe rotating Earth with latitude/longitude markers.
- **TOPOLOGY**: Contour topographic elevation lines with continuous morphing.

## Quick Implementation

\`\`\`html
<div id="vanta-hero" style="width: 100%; height: 500px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"></script>
<script>
  VANTA.WAVES({
    el: '#vanta-hero',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x171e52,       // Novotel Space Cadet
    shininess: 35.00,
    waveHeight: 15.00,
    waveSpeed: 0.75,
    zoom: 0.85
  });
</script>
\`\`\`
`;
installSkill('vanta-3d-backgrounds', vantaSkill);

// 7. 3d-prompt-collection
const threeDPromptSkill = `---
name: 3d-prompt-collection
description: Use when generating photorealistic 3D renders, architectural interiors, luxury hospitality suites, product mockups, and spatial UI assets using Midjourney, Imagen, or Gemini image generation.
---

# 3D Prompt Collection & Visual Art Direction

Curated prompts and lighting recipes for luxury rendering, spatial design, and architectural visualization.

## Luxury Hospitality & Architectural Prompts
- **Executive Suite Dusk**: "Ultra-luxury executive hotel penthouse suite overlooking dusk city skyline, warm 2700K recessed architectural lighting, brushed brass accents, Italian travertine marble floor, minimalist furniture, 8k resolution, raytraced reflections, Unreal Engine 5 render, ArchDaily aesthetic --ar 16:9"
- **Heated Infinity Pool**: "5-star resort heated infinity swimming pool at twilight, calm water surface reflecting deep indigo sky and subtle amber underwater illumination, private cabanas with linen curtains, mist rising gently, hyper-realistic, photorealistic Hasselblad shot --ar 16:9"
- **VIP Keycard & Stationery**: "Macro shot of luxury hotel executive welcome keycard, matte deep navy cardstock with embossed champagne gold foil crest, resting on raw white textured limestone, dramatic soft directional side-lighting, shallow depth of field --ar 1:1"
`;
installSkill('3d-prompt-collection', threeDPromptSkill);

// 8. voicestudio
const voiceStudioSkill = `---
name: voicestudio
description: Use when designing voice concierge personas, automated phone agent scripts, text-to-speech (TTS) voice cloning, multilingual pronunciation dictionaries, or luxury butler voice acoustics.
---

# VoiceStudio: Voice Butler & Concierge Synthesis

VoiceStudio provides tools and guidelines for creating natural, authoritative, and warm voice interfaces for automated phone agents and hotel concierge bots.

## Persona Formulation: Executive Hospitality Butler
- **Tone**: Warm, discreet, poised, calm, impeccably articulate.
- **Cadence**: 135-145 words per minute (slightly measured to convey elegance and ensure clarity).
- **Pitch**: Balanced baritone or warm mezzo-soprano with soft melodic contours and zero robotic compression.
- **Acoustic Environment**: High-end studio condenser microphone close-proximity effect, zero room reverberation, subtle warm low-end boost.

## Integration with Gemini Multimodal Live & Retell AI
- Formulate prompt system instructions specifying conversational turn-taking, empathetic confirmations, and pronunciation guides for guest names and luxury terms.
`;
installSkill('voicestudio', voiceStudioSkill);

console.log('All skills successfully generated and installed in both global and workspace environments!');
