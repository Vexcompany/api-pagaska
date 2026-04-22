const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const bulan = req.query.bulan; // optional filter

  try {
    const { data } = await axios.get('https://id.wikipedia.org/wiki/Daftar_hari_penting_di_Indonesia', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const hasil = [];

    $('.mw-parser-output ul li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes(':')) {
        const parts = text.split(':');
        const tanggal = parts[0].trim();
        const event = parts.slice(1).join(':').trim();
        const cleanText = (t) => t.replace(/\[\d+\]/g, '').trim();
        if (/\d/.test(tanggal) && tanggal.length < 30) {
          hasil.push({ tanggal: cleanText(tanggal), event: cleanText(event) });
        }
      }
    });

    const filtered = bulan
      ? hasil.filter(h => h.tanggal.toLowerCase().includes(bulan.toLowerCase()))
      : hasil;

    return res.status(200).json({
      success: true,
      total: filtered.length,
      filter: bulan || 'semua',
      data: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
