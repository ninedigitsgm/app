import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const htmlFile = path.join(distDir, 'index.html');

/**
 * Calculates cryptographic hashes for Subresource Integrity (SRI)
 */
function calculateHashes(buffer) {
  return {
    sha256: `sha256-${crypto.createHash('sha256').update(buffer).digest('base64')}`,
    sha384: `sha384-${crypto.createHash('sha384').update(buffer).digest('base64')}`,
    sha512: `sha512-${crypto.createHash('sha512').update(buffer).digest('base64')}`
  };
}

function processSRI() {
  if (!fs.existsSync(htmlFile)) {
    console.warn('[SRI] dist/index.html not found. Skipping SRI generation.');
    return;
  }

  let html = fs.readFileSync(htmlFile, 'utf8');
  const manifest = {
    generatedAt: new Date().toISOString(),
    algorithm: 'sha384',
    resources: {}
  };

  // 1. Process <script ... src="...">
  html = html.replace(/<script\b([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, before, src, after) => {
    // Skip external URLs or inline data URIs
    if (/^https?:\/\/|^\/\//i.test(src)) {
      return match;
    }

    const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
    const assetPath = path.join(distDir, cleanPath);

    if (fs.existsSync(assetPath)) {
      const buffer = fs.readFileSync(assetPath);
      const hashes = calculateHashes(buffer);
      manifest.resources[src] = {
        size: buffer.length,
        ...hashes
      };

      const hasCrossorigin = /crossorigin/i.test(match);
      const hasIntegrity = /integrity/i.test(match);

      let newTag = match;
      if (!hasIntegrity) {
        newTag = newTag.replace(/>$/, ` integrity="${hashes.sha384}">`);
      }
      if (!hasCrossorigin) {
        newTag = newTag.replace(/>$/, ` crossorigin="anonymous">`);
      }
      console.log(`[SRI] Injected sha384 integrity for script: ${src}`);
      return newTag;
    }

    return match;
  });

  // 2. Process <link rel="stylesheet" ... href="...">
  html = html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (match, before, href, after) => {
    const isStyle = /rel=["']stylesheet["']/i.test(match);
    if (!isStyle || /^https?:\/\/|^\/\//i.test(href)) {
      return match;
    }

    const cleanPath = href.replace(/^\.\//, '').replace(/^\//, '');
    const assetPath = path.join(distDir, cleanPath);

    if (fs.existsSync(assetPath)) {
      const buffer = fs.readFileSync(assetPath);
      const hashes = calculateHashes(buffer);
      manifest.resources[href] = {
        size: buffer.length,
        ...hashes
      };

      const hasCrossorigin = /crossorigin/i.test(match);
      const hasIntegrity = /integrity/i.test(match);

      let newTag = match;
      if (!hasIntegrity) {
        newTag = newTag.replace(/>$/, ` integrity="${hashes.sha384}">`);
      }
      if (!hasCrossorigin) {
        newTag = newTag.replace(/>$/, ` crossorigin="anonymous">`);
      }
      console.log(`[SRI] Injected sha384 integrity for stylesheet: ${href}`);
      return newTag;
    }

    return match;
  });

  fs.writeFileSync(htmlFile, html, 'utf8');

  // Save the manifest for cybersecurity compliance verification
  const manifestPath = path.join(distDir, 'sri-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[SRI] Generation complete. Manifest written to ${manifestPath}`);
}

processSRI();
