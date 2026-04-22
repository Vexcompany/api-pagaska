const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" (Twitter/X URL) wajib diisi.' });

  try {
    const { data } = await axios.post('https://www.expertsphp.com/instagram-reels-downloader.php', qs.stringify({ url }), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    const videoUrl = $('table.table-condensed tbody tr td video').attr('src') ||
                     $('table.table-condensed tbody tr td a[download]').attr('href');

    if (!videoUrl) throw new Error('Video tidak ditemukan. Pastikan URL valid.');

    return res.status(200).json({
      success: true,
      engine: 'Twitter/X',
      source: url,
      download_url: videoUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
