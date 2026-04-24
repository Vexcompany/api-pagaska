const yts = require('yt-search');

module.exports = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        error: 'Query is required'
      });
    }

    const yt = await yts.search(q);

    const result = yt.videos.map(video => ({
      title: video.title,
      channel: video.author.name,
      duration: video.duration.timestamp,
      imageUrl: video.thumbnail,
      link: video.url
    }));

    res.status(200).json({
      status: true,
      result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};
