const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const reqUrl = req.url || '/';
  let reqPath = decodeURI(reqUrl.split('?')[0]);

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API: Sync Song from Browser
  if (req.method === 'POST' && reqPath === '/api/sync-song') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const songData = JSON.parse(body);
        if (songData && songData.title) {
          const songsDir = path.join(__dirname, 'assets', 'songs');
          if (!fs.existsSync(songsDir)) fs.mkdirSync(songsDir, { recursive: true });

          const safeTitle = (songData.title || 'song').replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const targetFile = path.join(songsDir, `${safeTitle}.json`);
          fs.writeFileSync(targetFile, JSON.stringify(songData, null, 2), 'utf8');

          console.log(`\n🎉 [SYNC COMPLETO] Música "${songData.title}" recebida e salva com sucesso!`);
          console.log(`> Arquivo: ${targetFile}`);
          console.log(`> Notas: ${(songData.notes || []).length} | BPM: ${songData.bpm} | Duração: ${songData.duration}s\n`);

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: true, file: `${safeTitle}.json`, title: songData.title }));
          return;
        }
      } catch (err) {
        console.error('❌ Erro ao processar sync de música:', err);
      }
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Payload de música inválido' }));
    });
    return;
  }

  // Static File Serving
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let lanIps = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (net.address.startsWith('192.168.') || net.address.startsWith('10.')) {
          lanIps.unshift(net.address);
        } else {
          lanIps.push(net.address);
        }
      }
    }
  }
  const mainLanIp = lanIps[0] || 'localhost';
  console.log(`\n🎸 Guitar vs Zombies Server Online!`);
  console.log(`> Local: http://localhost:${PORT}`);
  console.log(`> LAN (Celular): http://${mainLanIp}:${PORT}\n`);
});
