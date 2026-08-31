import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// High-fidelity Gambian 9-Digits PWA & iOS App Icon SVG (512x512 with Gambian flag colors & clean typography)
const masterIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="gambiaRed" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CE1126" />
      <stop offset="100%" stop-color="#E52538" />
    </linearGradient>
    <linearGradient id="gambiaBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0C1C8C" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="gambiaGreen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3A7728" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  
  <!-- Subtle Glow / Ring -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-opacity="0.25" stroke-width="6" />

  <!-- Gambian Flag Tricolor Badge in Center Header -->
  <g transform="translate(156, 70)" filter="url(#shadow)">
    <rect width="200" height="24" rx="12" fill="#FFFFFF" />
    <rect x="2" y="2" width="196" height="6" rx="3" fill="url(#gambiaRed)" />
    <rect x="2" y="9" width="196" height="6" fill="url(#gambiaBlue)" />
    <rect x="2" y="16" width="196" height="6" rx="3" fill="url(#gambiaGreen)" />
  </g>

  <!-- Main "9" Digit Glyph with Phone Accent -->
  <g filter="url(#shadow)">
    <!-- Stylized 9 Digit -->
    <text x="256" y="340" 
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="240" 
          font-weight="900" 
          fill="#FFFFFF" 
          text-anchor="middle"
          letter-spacing="-6">9</text>
  </g>

  <!-- Subtitle Badge: DIGITS GM -->
  <g transform="translate(136, 380)">
    <rect width="240" height="46" rx="23" fill="#0369a1" stroke="#38bdf8" stroke-width="2" />
    <text x="120" y="30" 
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          font-size="20" 
          font-weight="800" 
          fill="#F8FAFC" 
          text-anchor="middle" 
          letter-spacing="3">DIGITS GM</text>
  </g>
</svg>`;

async function generateIcons() {
  const svgBuffer = Buffer.from(masterIconSvg);

  // Write master SVG
  fs.writeFileSync(path.join(publicDir, 'pwa-icon.svg'), masterIconSvg, 'utf8');

  // Generate PNG sizes required by iOS Safari, Android PWA, and desktop browsers
  const sizes = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`[ICON] Generated ${name} (${size}x${size})`);
  }

  console.log('[ICON] All PWA and iOS Apple Touch Icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('[ICON] Error generating icons:', err);
  process.exit(1);
});
