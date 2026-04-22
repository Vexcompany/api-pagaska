const axios = require('axios');

const PAGASKA_DATA = {
  namaLengkap: 'Paskibra Gala Taksaka SMKN 5 Kota Madiun',
  namasingkat: 'Pagaska',
  sekolah: 'SMKN 5 Kota Madiun',
  kota: 'Kota Madiun, Jawa Timur'
};

function buildSystemPrompt() {
  const d = new Date();
  const jam = d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
  const tgl = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return `Kamu adalah AI Pagaska, asisten digital resmi ${PAGASKA_DATA.namaLengkap}.
IDENTITASMU:
- Nama: AI Pagaska
- Organisasi: ${PAGASKA_DATA.namaLengkap}
- Sekolah: ${PAGASKA_DATA.sekolah}
- Kota: ${PAGASKA_DATA.kota}

KEPRIBADIAN: Tegas, disiplin, dan penuh semangat kebangsaan. Ramah dan informatif.

ATURAN:
1. Selalu jawab dalam Bahasa Indonesia
2. Jika data tidak tersedia, katakan "data tersebut belum tersedia, silakan hubungi pengurus langsung"
3. Kamu BUKAN ChatGPT atau Claude. Kamu adalah AI Pagaska.
4. Waktu saat ini: ${tgl}, pukul ${jam} WIB`.trim();
}

const conversations = {};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });

  const { message, userId = 'default', reset = false } = req.body;

  if (reset) {
    delete conversations[userId];
    return res.status(200).json({ success: true, message: 'Percakapan direset.' });
  }

  if (!message) return res.status(400).json({ success: false, error: 'Field "message" wajib diisi.' });

  try {
    if (!conversations[userId]) conversations[userId] = [];
    conversations[userId].push({ role: 'user', content: message });

    const { data } = await axios.post('https://chateverywhere.app/api/chat/', {
      model: { id: 'gpt-4', name: 'GPT-4', maxLength: 32000, tokenLimit: 8000 },
      messages: conversations[userId],
      prompt: buildSystemPrompt(),
      temperature: 0.6
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' },
      timeout: 30000
    });

    const reply = typeof data === 'string' ? data : JSON.stringify(data);
    conversations[userId].push({ role: 'assistant', content: reply });

    return res.status(200).json({
      success: true,
      engine: 'AI Pagaska',
      userId,
      response: reply,
      organisasi: PAGASKA_DATA.namaLengkap
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
