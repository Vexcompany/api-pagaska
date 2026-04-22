module.exports = async (req, res) => {
  try {
    const { pp } = req.query;

    if (!pp) {
      return res.status(400).json({ error: 'pp required' });
    }

    const buffer = await fakemlafinitas(pp);

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};