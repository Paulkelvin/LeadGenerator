/**
 * Lightweight proxy for Companies House API.
 * Forwards requests from the browser to avoid CORS issues.
 *
 * Usage:
 *   CH_API_KEY=your_key_here node proxy/server.js
 *
 * Then update src/lib/companiesHouse.js BASE_URL to:
 *   http://localhost:3001/api
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.CH_API_KEY || '';
const TARGET = 'https://api.company-information.service.gov.uk';

if (!API_KEY) {
  console.warn('[proxy] Warning: CH_API_KEY env var is not set.');
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Strip /api prefix
  const path = req.url.replace(/^\/api/, '') || '/';
  const targetUrl = new URL(TARGET + path);

  const authHeader = 'Basic ' + Buffer.from(API_KEY + ':').toString('base64');

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('[proxy] Error:', err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`[proxy] Running on http://localhost:${PORT}`);
  console.log(`[proxy] Forwarding to ${TARGET}`);
  if (API_KEY) {
    console.log(`[proxy] API key: ${API_KEY.slice(0, 4)}${'*'.repeat(Math.max(0, API_KEY.length - 4))}`);
  }
});
