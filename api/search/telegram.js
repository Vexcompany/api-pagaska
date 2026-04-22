const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q || req.query.query;
  if (!query) return res.status(400).json({ success: false, error: 'Parameter "q" wajib diisi.' });

  const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  try {
    const { data } = await axios.get(`https://en.tgramsearch.com/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': agent }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.channel-item, .search-result').each((_, el) => {
      const name = $(el).find('.channel-name, h3, h4').first().text().trim();
      const desc = $(el).find('.channel-description, p').first().text().trim();
      const link = $(el).find('a').first().attr('href');
      const members = $(el).find('.members, .subscribers').first().text().trim();
      if (name) results.push({ name, description: desc, link, members });
    });

    return res.status(200).json({ success: true, query, total: results.length, results });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
