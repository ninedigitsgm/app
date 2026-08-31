# Subresource Integrity (SRI) & Build Security Documentation

## 1. Overview & Purpose
Subresource Integrity (W3C SRI / RFC 9309) is a vital security feature that allows modern web browsers to verify that assets (JavaScript scripts, CSS stylesheets) fetched from servers or CDNs are delivered without unexpected manipulation or unauthorized tampering.

If a malicious third party or proxy alters a script or stylesheet in transit, the cryptographic hash will not match the declared `integrity` attribute, and the browser will immediately block execution.

---

## 2. Automated SRI Generation in Build Pipeline

This project employs an automated post-build Subresource Integrity generator (`scripts/generate-sri.js`) executed on every production build:

```bash
npm run build
```

The build pipeline performs the following steps:
1. **Vite Compilation**: Generates fingerprinted JavaScript and CSS bundles into `dist/assets/`.
2. **Cryptographic Hashing**: Reads all referenced output files and calculates SHA-384 base64 hashes using Node.js `crypto`.
3. **HTML Injection**: Injects `integrity="sha384-..."` and `crossorigin="anonymous"` directly onto all `<script>` and `<link rel="stylesheet">` tags in `dist/index.html`.
4. **Audit Manifest**: Writes `dist/sri-manifest.json` containing SHA-256, SHA-384, and SHA-512 hashes and exact byte counts for each asset.

---

## 3. Verification Commands for Cyber Security Audits

To audit the authenticity of production build artifacts, run the following commands:

### Calculate Hashes Locally:
```bash
# Calculate SHA-384 hash of your main bundle in dist/assets
openssl dgst -sha384 -binary dist/assets/index-*.js | openssl base64 -A
```

### Inspect the Injected HTML Tags:
Open `dist/index.html` and verify the integrity attribute on the script tag:
```html
<script type="module" crossorigin="anonymous" integrity="sha384-..." src="./assets/index-XXXX.js"></script>
```

### Inspect the Audit Manifest:
Open `dist/sri-manifest.json`:
```json
{
  "generatedAt": "2026-08-30T...",
  "algorithm": "sha384",
  "resources": {
    "./assets/index-XXXX.js": {
      "size": 123456,
      "sha256": "sha256-...",
      "sha384": "sha384-...",
      "sha512": "sha512-..."
    }
  }
}
```

---

## 4. Continuous Integration & Deployment (GitHub Actions)

In `.github/workflows/deploy.yml`, the build step runs `npm run build`, which automatically runs `scripts/generate-sri.js` before deploying to GitHub Pages. All deployed assets on GitHub Pages are strictly verified with SHA-384 integrity checks before browser execution.
