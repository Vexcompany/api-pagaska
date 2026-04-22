const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q || req.query.query;
  const count = parseInt(req.query.count) || 12;
  if (!query) return res.status(400).json({ success: false, error: 'Parameter "q" wajib diisi.' });

  try {
    const payload = new URLSearchParams({ keywords: query, count, cursor: 0, HD: 1 });
    const { data } = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': 'current_language=en'
      },
      data: payload.toString()
    });

    return res.status(200).json({
      success: true,
      query,
      total: data?.data?.videos?.length || 0,
      results: (data?.data?.videos || []).map(v => ({
        id: v.video_id,
        title: v.title,
        author: v.author?.nickname,
        play: v.play,
        cover: v.cover,
        duration: v.duration
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
