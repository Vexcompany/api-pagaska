const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q || req.query.query;
  if (!query) return res.status(400).json({ success: false, error: 'Parameter "q" (kata pencarian) wajib diisi.' });

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
    'Accept': 'application/json'
  };

  try {
    const searchRes = await axios.get('https://id.wikipedia.org/w/api.php', {
      params: { action: 'query', list: 'search', srsearch: query, format: 'json', srlimit: 3 },
      headers
    });

    const results = searchRes.data.query.search;
    if (!results || results.length === 0) return res.status(404).json({ success: false, error: 'Tidak ditemukan.' });

    const pageTitle = results[0].title;
    const pageRes = await axios.get('https://id.wikipedia.org/w/api.php', {
      params: { action: 'query', titles: pageTitle, prop: 'extracts|info', exintro: 1, explaintext: 1, inprop: 'url', format: 'json' },
      headers
    });

    const pages = pageRes.data.query.pages;
    const page = pages[Object.keys(pages)[0]];

    return res.status(200).json({
      success: true,
      title: page.title,
      url: page.fullurl,
      summary: page.extract,
      search_results: results.map(r => ({ title: r.title, snippet: r.snippet.replace(/<[^>]*>/g, '') }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
