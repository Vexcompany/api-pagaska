const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q || req.query.query;
  if (!query) return res.status(400).json({ success: false, error: 'Parameter "q" (judul lagu) wajib diisi.' });

  try {
    const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' }
    });

    if (!data || !data[0]) return res.status(404).json({ success: false, error: 'Lirik tidak ditemukan.' });

    const song = data[0];
    const lyricsRaw = song.plainLyrics || song.syncedLyrics;
    const cleanLyrics = lyricsRaw ? lyricsRaw.replace(/\[.*?\]/g, '').trim() : null;

    return res.status(200).json({
      success: true,
      title: song.trackName,
      artist: song.artistName,
      album: song.albumName,
      duration: song.duration,
      lyrics: cleanLyrics
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
