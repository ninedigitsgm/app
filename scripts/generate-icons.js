import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputSvg = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(inputSvg);

const appleSizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 }
];

async function generate() {
  for (const { name, size } of appleSizes) {
    const outPath = path.resolve('public', name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
