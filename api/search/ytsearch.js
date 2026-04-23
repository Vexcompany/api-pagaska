const yts = require('yt-search');

module.exports = {
    category: 'Search',
    params: ['q'],
    async run(req, res) {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query is required' });
        
        try {
            const yt = await yts.search(q);
            const result = yt.videos.map(video => ({
                title: video.title,
                channel: video.author.name,
                duration: video.duration.timestamp,
                imageUrl: video.thumbnail,
                link: video.url
            }));
            res.status(200).json({
                result
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
