module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });

  const { message, model = 'gemini-pro' } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Field "message" wajib diisi.' });

  const validModels = ['gemini-pro', 'gemini-1.5', 'gemini-flash'];
  const selectedModel = validModels.includes(model) ? model : 'gemini-pro';

  try {
    const response = await fetch('https://aliyun.zaiwen.top/message_gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PagaskaAI/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        message: [
          { role: 'system', content: `You are a helpful AI assistant named ${selectedModel}. Created by Pagaska API.` },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const aiReply = await response.text();
    if (!aiReply) throw new Error('No response from Gemini API');

    return res.status(200).json({
      success: true,
      engine: 'Gemini',
      model: selectedModel,
      response: aiReply
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
