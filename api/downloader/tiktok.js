const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" wajib diisi.' });

  const _base = 'https://albertaibdconsortium.ca/';
  try {
    const { data } = await axios({
      method: 'POST',
      url: _base,
      headers: {
        'HX-Request': 'true',
        'HX-Current-URL': _base,
        'HX-Boosted': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      data: new URLSearchParams({ url }).toString()
    });

    const $ = cheerio.load(data);
    const title = $('p.mt-2.line-clamp-3').text().trim();
    const author = $('h3.mt-6').text().trim();
    const thumbnail = $('img.h-40.w-40').attr('src');
    const links = [];
    $('a[href^="https://"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      if (href && href.includes('token=')) {
        links.push({ type: text.includes('mp3') ? 'audio' : 'video', label: $(el).text().trim(), url: href });
      }
    });

    return res.status(200).json({
      success: true,
      source: url,
      metadata: { author, title, thumbnail },
      media: {
        video: links.find(l => l.type === 'video')?.url || null,
        audio: links.find(l => l.type === 'audio')?.url || null,
        all_links: links
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
