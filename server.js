/**
 * Production Web Server for Render
 * ──────────────────────────────────────────
 * Lightweight, zero-dependency Node HTTP server.
 * - Serves static website files (HTML, CSS, JS, images)
 * - Injects runtime Render environment variables into frontend
 * - Handles /api/health for Render zero-downtime checks
 * - Handles /api/config for runtime environment discovery
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

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

  // Image proxy endpoint for Google Drive & external images (bypasses Brave Shields & hotlinking blocks)
  if (pathname === '/api/proxy-image') {
    let targetId = '';
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      targetId = parsedUrl.searchParams.get('id') || '';
      const rawUrl = parsedUrl.searchParams.get('url') || '';
      if (!targetId && rawUrl) {
        const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) targetId = match[1];
      }
    } catch (e) {}

    if (!targetId) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing Drive image id');
      return;
    }

    function pipeUrl(targetUrl, maxRedirects) {
      if (maxRedirects <= 0) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Too many redirects');
        return;
      }
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      }, upstream => {
        if (upstream.statusCode >= 300 && upstream.statusCode < 400 && upstream.headers.location) {
          pipeUrl(upstream.headers.location, maxRedirects - 1);
          return;
        }
        if (upstream.statusCode !== 200) {
          // Fallback to drive thumbnail if lh3 fails
          if (targetUrl.includes('lh3.googleusercontent.com')) {
            pipeUrl(`https://drive.google.com/thumbnail?id=${targetId}&sz=w1200`, maxRedirects - 1);
            return;
          }
          res.writeHead(upstream.statusCode, { 'Content-Type': 'text/plain' });
          res.end('Upstream image error ' + upstream.statusCode);
          return;
        }
        res.writeHead(200, {
          'Content-Type': upstream.headers['content-type'] || 'image/jpeg',
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*'
        });
        upstream.pipe(res);
      }).on('error', err => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
      });
    }

    pipeUrl(`https://lh3.googleusercontent.com/d/${targetId}`, 3);
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
    if (ext === '.html' || ext === '.js' || ext === '.css') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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
