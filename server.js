/**
 * Production Web Server for Render
 * ──────────────────────────────────────────
 * Lightweight, zero-dependency Node HTTP server.
 * - Serves static website files (HTML, CSS, JS, images)
 * - Injects runtime Render environment variables into frontend
 * - Handles /api/health for Render zero-downtime checks
 * - Handles /api/config for runtime environment discovery
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// Run build script on boot to ensure js/config.js matches current environment variables
try {
  require('./build.js');
} catch (e) {
  console.warn('[Server] Note on build step:', e.message);
}

const PORT = parseInt(process.env.PORT, 10) || 10000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2'
};

const server = http.createServer((req, res) => {
  let pathname = '/';
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = parsedUrl.pathname;
  } catch (e) {
    pathname = req.url.split('?')[0];
  }

  // Security headers
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Health check endpoint for Render
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));
    return;
  }

  // Runtime public config endpoint
  if (pathname === '/api/config') {
    function normalizeUrl(u) {
      if (!u) return '';
      u = u.trim();
      if (u.startsWith('postgresql://') || u.startsWith('postgres://')) {
        const m = u.match(/postgres\.([a-z0-9_-]+):/i);
        if (m) return `https://${m[1]}.supabase.co`;
      }
      if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
      return u.replace(/\/+$/, '');
    }
    const cleanUrl = normalizeUrl(process.env.SUPABASE_URL || '');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      supabaseUrl: cleanUrl,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      adminUsername: process.env.ADMIN_USERNAME || 'admin',
      isConfigured: Boolean(cleanUrl && process.env.SUPABASE_ANON_KEY)
    }));
    return;
  }

  // Normalize path for static files
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent path traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA routing to index.html if no file extension
      if (!path.extname(pathname)) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Caching headers
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🌟 PM SHRI Kendriya Vidyalaya Portal Server Running`);
  console.log(`   Listening on port : ${PORT}`);
  console.log(`   Environment       : ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Health Endpoint   : http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
