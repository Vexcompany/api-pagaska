const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q || req.query.query;
  if (!query) return res.status(400).json({ success: false, error: 'Parameter "q" (judul lagu) wajib diisi.' });

  try {
    const { data } = await axios.get(`https://www.gitagram.com/index.php?cat=&s=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const $ = cheerio.load(data);
    const results = [];

    $('table.table tbody tr').each((_, el) => {
      const title = $(el).find('span.title.is-6').text().trim();
      const artist = $(el).find('span.subtitle.is-6').text().replace('‣', '').trim();
      const link = $(el).find('a').attr('href');
      const type = $(el).find('span.title.is-7').text().trim();
      if (title) results.push({ title, artist, link, type });
    });

    return res.status(200).json({ success: true, query, total: results.length, results });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
