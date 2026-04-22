const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });

  const { message, chatId = 'e6d80bed-6b42-4ea0-a5ac-01d4e9175ee1' } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Field "message" wajib diisi.' });

  try {
    const requestData = [{
      chatId,
      messages: [
        { id: crypto.randomUUID(), role: 'user', content: message, parts: [{ type: 'text', text: message }], createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), role: 'assistant', content: '', parts: [{ type: 'text', text: '' }], createdAt: new Date().toISOString() }
      ],
      selectedChatModel: 'chat-model-reasoning'
    }];

    const response = await fetch('https://unlimitedai.io/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const text = await response.text();
    return res.status(200).json({
      success: true,
      engine: 'UnlimitedAI',
      response: text
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
