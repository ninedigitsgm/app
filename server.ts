import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares to handle larger contact lists (VCF content size)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API route to force binary/octet-stream download of VCF files for iOS/macOS Safari direct downloading
  app.post('/api/download-vcf', (req, res) => {
    const { content, filename } = req.body;
    if (!content) {
      return res.status(400).send('No content provided');
    }

    const safeFilename = filename || 'contacts.vcf';

    // Force Safari and other browsers to treat this as an un-executable attachment
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    
    // Send raw file content
    res.send(content);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development or serving compiled assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
