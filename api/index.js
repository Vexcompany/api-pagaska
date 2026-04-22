const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.enable('trust proxy');
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (UI)
app.use(express.static(path.join(__dirname, '../public')));

// ── AI Routes ──────────────────────────────────────────────
app.all('/api/ai/deepseek',    require('./ai/deepseek'));
app.all('/api/ai/gemini',      require('./ai/gemini'));
app.all('/api/ai/pixel',       require('./ai/pixel'));
app.all('/api/ai/unlimited',   require('./ai/unlimited'));
app.all('/api/ai/pagaskaai',   require('./ai/pagaskaai'));

// ── Downloader Routes ──────────────────────────────────────
app.all('/api/downloader/tiktok',      require('./downloader/tiktok'));
app.all('/api/downloader/ytmp3',       require('./downloader/ytmp3'));
app.all('/api/downloader/ytmp4',       require('./downloader/ytmp4'));
app.all('/api/downloader/soundcloud',  require('./downloader/soundcloud'));
app.all('/api/downloader/twitter',     require('./downloader/twitter'));

// ── Search Routes ──────────────────────────────────────────
app.all('/api/search/wikipedia',  require('./search/wikipedia'));
app.all('/api/search/chord',      require('./search/chord'));
app.all('/api/search/lyric',      require('./search/lyric'));
app.all('/api/search/tiktok',     require('./search/tiktok'));
app.all('/api/search/telegram',   require('./search/telegram'));

// ── Proker Routes ──────────────────────────────────────────
app.all('/api/proker/haripenting', require('./proker/haripenting'));

// ── API Info Endpoint ──────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'Pagaska REST API',
    version: '1.0.0',
    description: 'REST API milik Paskibra Gala Taksaka SMKN 5 Kota Madiun',
    endpoints: {
      ai: [
        { path: '/api/ai/deepseek',   method: 'POST', params: ['message', 'mode?'] },
        { path: '/api/ai/gemini',     method: 'POST', params: ['message', 'model?'] },
        { path: '/api/ai/pixel',      method: 'POST', params: ['message', 'characterId?'] },
        { path: '/api/ai/unlimited',  method: 'POST', params: ['message'] },
        { path: '/api/ai/pagaskaai',  method: 'POST', params: ['message', 'userId?', 'reset?'] }
      ],
      downloader: [
        { path: '/api/downloader/tiktok',     method: 'GET/POST', params: ['url'] },
        { path: '/api/downloader/ytmp3',      method: 'GET/POST', params: ['url', 'quality?'] },
        { path: '/api/downloader/ytmp4',      method: 'GET/POST', params: ['url', 'quality?'] },
        { path: '/api/downloader/soundcloud', method: 'GET/POST', params: ['url'] },
        { path: '/api/downloader/twitter',    method: 'GET/POST', params: ['url'] }
      ],
      search: [
        { path: '/api/search/wikipedia', method: 'GET', params: ['q'] },
        { path: '/api/search/chord',     method: 'GET', params: ['q'] },
        { path: '/api/search/lyric',     method: 'GET', params: ['q'] },
        { path: '/api/search/tiktok',    method: 'GET', params: ['q', 'count?'] },
        { path: '/api/search/telegram',  method: 'GET', params: ['q'] }
      ],
      proker: [
        { path: '/api/proker/haripenting', method: 'GET', params: ['bulan?'] }
      ]
    }
  });
});

// ── Serve UI ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan.' });
});

// ── Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

module.exports = app;
