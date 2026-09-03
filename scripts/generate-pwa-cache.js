import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const swFile = path.join(distDir, 'sw.js');

/**
 * Scans dist directory and injects all generated assets into dist/sw.js
 * so that the Service Worker precaches 100% of application code,
 * scripts, styles, SVGs, and images for flawless offline operation.
 */
function generatePwaCache() {
  if (!fs.existsSync(distDir)) {
    console.warn('[PWA] dist/ directory not found. Skipping SW asset injection.');
    return;
  }

  if (!fs.existsSync(swFile)) {
    console.warn('[PWA] dist/sw.js not found. Skipping SW asset injection.');
    return;
  }

  const allAssets = new Set([
    './',
    './index.html',
    './manifest.webmanifest',
    './manifest.json'
  ]);

  // Recursively collect all files in dist/
  function scanDir(currentDir, relativePrefix = './') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = relativePrefix + entry.name;

      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath + '/');
      } else if (entry.isFile()) {
        // Exclude sw.js itself, source maps, robots, sitemap, and SRI manifest
        if (
          entry.name === 'sw.js' ||
          entry.name.endsWith('.map') ||
          entry.name === 'robots.txt' ||
          entry.name === 'sitemap.xml' ||
          entry.name === 'sri-manifest.json'
        ) {
          continue;
        }
        allAssets.add(relativePath);
      }
    }
  }

  scanDir(distDir);

  const assetList = Array.from(allAssets).sort();

  // Create hash of all file names and modification times for automatic cache busting
  const hashSum = crypto.createHash('sha256');
  for (const asset of assetList) {
    const cleanPath = asset.replace(/^\.\//, '');
    const fullPath = path.join(distDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      hashSum.update(asset);
      const stat = fs.statSync(fullPath);
      hashSum.update(stat.mtimeMs.toString());
    }
  }
  const versionHash = hashSum.digest('hex').substring(0, 10);
  const cacheVersionName = `gambia-9digits-${versionHash}`;

  let swContent = fs.readFileSync(swFile, 'utf8');

  // Replace CACHE_NAME
  swContent = swContent.replace(
    /const\s+CACHE_NAME\s*=\s*['"][^'"]+['"];/,
    `const CACHE_NAME = '${cacheVersionName}';`
  );

  // Replace STATIC_ASSETS array
  const formattedAssetList = JSON.stringify(assetList, null, 2);
  swContent = swContent.replace(
    /const\s+STATIC_ASSETS\s*=\s*\[[\s\S]*?\];/,
    `const STATIC_ASSETS = ${formattedAssetList};`
  );

  fs.writeFileSync(swFile, swContent, 'utf8');
  console.log(`[PWA] Injected ${assetList.length} assets into dist/sw.js with cache ID: ${cacheVersionName}`);
}

generatePwaCache();
