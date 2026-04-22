const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  const quality = req.method === 'GET' ? (req.query.quality || '720') : (req.body?.quality || '720');

  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" (YouTube URL) wajib diisi.' });

  try {
    const { data } = await axios.get('https://host.optikl.ink/download/youtube', {
      params: { url, format: quality }
    });

    if (!data.status) return res.status(400).json({ success: false, error: 'Gagal mengambil video.' });

    return res.status(200).json({
      success: true,
      engine: 'optikl',
      result: {
        title: data.result?.title,
        type: data.result?.type,
        quality: data.result?.quality,
        thumbnail: data.result?.thumbnail,
        duration: data.result?.duration,
        url: data.result?.download
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
