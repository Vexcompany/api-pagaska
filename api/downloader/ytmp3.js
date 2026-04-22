const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  const quality = req.method === 'GET' ? (req.query.quality || '4') : (req.body?.quality || '4');

  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" (YouTube URL) wajib diisi.' });

  try {
    // Extract video ID
    const idMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = idMatch ? idMatch[1] : url;

    const response = await axios.post('https://cnvmp3.com/check_database.php', {
      youtube_id: videoId,
      quality: parseInt(quality),
      formatValue: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        'Referer': 'https://cnvmp3.com/v51'
      }
    });

    return res.status(200).json({
      success: response.data.success,
      engine: 'cnvmp3',
      videoId,
      data: response.data.data || response.data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
