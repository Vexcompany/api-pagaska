const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" (SoundCloud URL) wajib diisi.' });

  const config = {
    baseUrl: 'https://sc.snapfirecdn.com',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  try {
    const { data: info } = await axios.post(`${config.baseUrl}/soundcloud`, { target: url, gsc: 'x' }, { headers: config.headers });
    if (!info.progressive_url) throw new Error('Progressive URL tidak ditemukan.');

    const { data: dl } = await axios.post(`${config.baseUrl}/progressive`, { progressive_url: info.progressive_url }, { headers: config.headers });

    return res.status(200).json({
      success: true,
      engine: 'SoundCloud',
      result: {
        title: info.title,
        author: info.user?.username,
        thumbnail: info.artwork_url,
        duration: info.duration,
        download_url: dl.url || dl.download_url
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
