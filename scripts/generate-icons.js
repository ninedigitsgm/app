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
    const buf = await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100 })
      .toBuffer();
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
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
