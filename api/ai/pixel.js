const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });

  const { message, characterId = '6472508d-5763-415d-8d8e-db48c7fbd05a', conversationId = null } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Field "message" wajib diisi.' });

  try {
    const response = await fetch('https://prod.nd-api.com/chat', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Guest-UserId': crypto.randomUUID(),
        'X-App-Id': 'pixelchat'
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        character_id: characterId,
        language: 'id',
        inference_model: 'default',
        inference_settings: { max_new_tokens: 180, temperature: 0.7 },
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    return res.status(200).json({
      success: true,
      engine: 'Pixel',
      characterId,
      response: data?.message || data?.content || data
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
