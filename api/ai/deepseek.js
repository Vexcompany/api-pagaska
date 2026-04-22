module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });

  const { message, mode = 'flash' } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Field "message" wajib diisi.' });

  try {
    const nonceRes = await fetch('https://chat-deep.ai', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const nonceHtml = await nonceRes.text();
    const nonceMatch = nonceHtml.match(/"nonce":"([a-f0-9]+)"/);
    if (!nonceMatch) throw new Error('NONCE_NOT_FOUND');

    const params = new URLSearchParams({
      action: 'deepseek_chat',
      message,
      model: mode === 'think' ? 'deepseek-reasoner' : 'deepseek-chat',
      nonce: nonceMatch[1],
      save_conversation: '0',
      session_only: '1'
    });

    const response = await fetch('https://chat-deep.ai/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://chat-deep.ai',
        'Referer': 'https://chat-deep.ai/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: params.toString()
    });

    const data = await response.json();
    const rawContent = data?.data?.response || data?.response || '';
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);

    return res.status(200).json({
      success: true,
      engine: 'DeepSeek',
      mode,
      think: mode === 'think' ? (thinkMatch ? thinkMatch[1].trim() : null) : null,
      response: rawContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
