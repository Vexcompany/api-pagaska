const axios = require('axios');
const cheerio = require('cheerio');

const igDown = {
  generateIP: () => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
  },
  download: async (url) => {
    try {
      if (!url.includes('instagram.com')) throw new Error('Link Instagram tidak valid!');

      const randomIP = igDown.generateIP();
      const client = axios.create({
        baseURL: 'https://indown.io',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'x-forwarded-for': randomIP,
          'x-real-ip': randomIP
        }
      });

      const getHome = await client.get('/');
      const $ = cheerio.load(getHome.data);
      const token = $('input[name="_token"]').val();
      const cookies = getHome.headers['set-cookie']?.join('; ');

      if (!token) throw new Error('Gagal mendapatkan token sesi!');

      const params = new URLSearchParams();
      params.append('referer', 'https://indown.io/');
      params.append('locale', 'en');
      params.append('_token', token);
      params.append('link', url);

      const { data: resultHtml } = await client.post('/download', params, {
        headers: {
          'Cookie': cookies,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const $res = cheerio.load(resultHtml);
      const media = [];

      const video = $res('div.container.mt-4 video source').attr('src');
      if (video) {
        media.push({ type: 'video', url: video });
      } else {
        $res('div.container.mt-4 img').each((i, el) => {
          const img = $res(el).attr('src');
          if (img && !img.includes('logo')) media.push({ type: 'image', url: img });
        });
      }

      if (media.length === 0) throw new Error('Media tidak tersedia atau URL tidak valid.');

      return { status: true, total: media.length, result: media };
    } catch (err) {
      return { status: false, msg: err.message };
    }
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.method === 'GET' ? req.query.url : req.body?.url;
  if (!url) return res.status(400).json({ success: false, error: 'Parameter "url" (Instagram URL) wajib diisi.' });

  const result = await igDown.download(url);

  if (!result.status) {
    return res.status(500).json({ success: false, error: result.msg });
  }

  return res.status(200).json({
    success: true,
    engine: 'Instagram (indown.io)',
    source: url,
    total: result.total,
    media: result.result
  });
};
