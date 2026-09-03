import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputSvg = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(inputSvg);

const pngOutputs = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-128x128.png', size: 128 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-256x256.png', size: 256 },
  { name: 'pwa-384x384.png', size: 384 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 }
];

async function generate() {
  const icoBuffers = [];

  for (const { name, size } of pngOutputs) {
    const outPath = path.resolve('public', name);
    let buf;
    if (size >= 64) {
      const innerSize = Math.round(size * 0.72);
      const resizedSvg = await sharp(svgBuffer)
        .resize(innerSize, innerSize)
        .toBuffer();

      buf = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        }
      })
        .composite([{ input: resizedSvg, gravity: 'center' }])
        .png({ quality: 100 })
        .toBuffer();
    } else {
      buf = await sharp(svgBuffer)
        .resize(size, size)
        .png({ quality: 100 })
        .toBuffer();
    }
    fs.writeFileSync(outPath, buf);
    console.log(`Generated ${name} (${size}x${size})`);

    if ([16, 32, 48].includes(size)) {
      icoBuffers.push({ width: size, height: size, buffer: buf });
    }
  }

  // Generate multi-resolution transparent favicon.ico
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoBuffers.length, 4);

  let offset = 6 + icoBuffers.length * 16;
  const entries = [];
  for (const img of icoBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...icoBuffers.map(i => i.buffer)]);
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  console.log('Generated multi-resolution favicon.ico (16x16, 32x32, 48x48)');

  // Generate 1200x630 Social Preview Card (og-image.png) for WhatsApp, Facebook, Telegram, Google Messages
  const ogWidth = 1200;
  const ogHeight = 630;
  const ogSvg = `
  <svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1329" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#022c22" />
      </linearGradient>
      <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#CE1126" />
        <stop offset="32%" stop-color="#CE1126" />
        <stop offset="38%" stop-color="#FFFFFF" />
        <stop offset="44%" stop-color="#0C1C8C" />
        <stop offset="56%" stop-color="#0C1C8C" />
        <stop offset="62%" stop-color="#FFFFFF" />
        <stop offset="68%" stop-color="#3A7728" />
        <stop offset="100%" stop-color="#3A7728" />
      </linearGradient>
    </defs>
    
    <rect width="${ogWidth}" height="${ogHeight}" fill="url(#bgGrad)" />
    
    <circle cx="150" cy="150" r="200" fill="#10b981" opacity="0.07" />
    <circle cx="1050" cy="480" r="250" fill="#3b82f6" opacity="0.08" />
    
    <rect x="0" y="0" width="${ogWidth}" height="14" fill="url(#flagGrad)" />
    
    <rect x="40" y="44" width="1120" height="546" rx="28" fill="none" stroke="#334155" stroke-width="2" stroke-opacity="0.6" />
    
    <g transform="translate(80, 100)">
      <rect x="0" y="0" width="340" height="38" rx="19" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
      <text x="25" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#60a5fa" letter-spacing="1.5">THE GAMBIA : PURA COMPLIANT</text>
    </g>
    
    <text x="80" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="50" font-weight="900" fill="#ffffff" letter-spacing="-1">
      Automatic 9-Digits
    </text>
    <text x="80" y="265" font-family="system-ui, -apple-system, sans-serif" font-size="50" font-weight="900" fill="#34d399" letter-spacing="-1">
      Contacts Upgrader
    </text>
    
    <text x="80" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#94a3b8">
      Upgrade your Gambian phonebook instantly and safely to 9 digits
    </text>
    
    <g transform="translate(80, 370)">
      <rect x="0" y="0" width="180" height="48" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
      <circle cx="24" cy="24" r="8" fill="#ea580c" />
      <text x="42" y="29" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc">Africell (+87)</text>
      
      <rect x="196" y="0" width="170" height="48" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
      <circle cx="220" cy="24" r="8" fill="#eab308" />
      <text x="238" y="29" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc">QCell (+83)</text>
      
      <rect x="382" y="0" width="180" height="48" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
      <circle cx="406" cy="24" r="8" fill="#06b6d4" />
      <text x="424" y="29" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc">Comium (+86)</text>
    </g>
    
    <g transform="translate(80, 480)">
      <text x="0" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#10b981">
        + 100% Private and On-Device
      </text>
      <text x="320" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#10b981">
        + Free and Open Source
      </text>
      <text x="580" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#10b981">
        + Works Offline (PWA)
      </text>
    </g>
  </svg>
  `;

  const ogSvgBuf = Buffer.from(ogSvg);
  const iconBuf = await sharp(path.resolve('public/pwa-512x512.png')).resize(240, 240).toBuffer();
  const ogImgBuf = await sharp(ogSvgBuf)
    .composite([{ input: iconBuf, left: 880, top: 160 }])
    .png({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(path.resolve('public/og-image.png'), ogImgBuf);
  console.log('Generated og-image.png (1200x630 social preview card)');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
