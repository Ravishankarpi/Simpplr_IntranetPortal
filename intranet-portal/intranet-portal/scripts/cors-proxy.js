// Zero-dependency local CORS proxy for Salesforce media downloads
// Run via: node scripts/cors-proxy.js (or npm run proxy)
const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 8010;

function fetchWithRedirects(targetUrl, incomingReq, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Too many redirects'));
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('Invalid URL: ' + targetUrl));
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const headers = {};

    if (incomingReq.headers['authorization']) {
      headers['authorization'] = incomingReq.headers['authorization'];
    }
    if (incomingReq.headers['accept']) {
      headers['accept'] = incomingReq.headers['accept'];
    }

    const options = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: headers
    };

    const req = client.request(options, (res) => {
      // Follow 301, 302, 303, 307, 308 redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, targetUrl).toString();
        }
        res.resume(); // consume response data to free memory
        return resolve(fetchWithRedirects(redirectUrl, incomingReq, maxRedirects - 1));
      }

      resolve(res);
    });

    req.on('error', reject);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers for any incoming browser request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let targetUrl = '';
  try {
    const incomingUrl = new URL(req.url, `http://localhost:${PORT}`);
    targetUrl = incomingUrl.searchParams.get('url');
    // If not query param, support /proxy/<url>
    if (!targetUrl && req.url.startsWith('/proxy/')) {
      targetUrl = req.url.replace('/proxy/', '');
    }
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to parse request URL' }));
    return;
  }

  if (!targetUrl) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h2>Local CORS Proxy is Running!</h2>
      <p>Usage: <code>http://localhost:${PORT}/?url=&lt;ENCODED_SALESFORCE_URL&gt;</code></p>
    `);
    return;
  }

  try {
    const remoteRes = await fetchWithRedirects(targetUrl, req);
    const contentType = remoteRes.headers['content-type'] || 'application/octet-stream';

    res.writeHead(remoteRes.statusCode, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });

    remoteRes.pipe(res);
    console.log(`[${new Date().toLocaleTimeString()}] Proxied [${remoteRes.statusCode}] ${targetUrl.substring(0, 90)}...`);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error proxying ${targetUrl}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CORS Proxy Server running at http://localhost:${PORT}`);
  console.log(`   Use in SPFx URL Conversion as: http://localhost:${PORT}/?url=`);
  console.log(`====================================================`);
});
