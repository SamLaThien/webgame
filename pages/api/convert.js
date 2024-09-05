const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const videoId = ytdl.getURLVideoID(url);
    const outputPath = path.join(process.cwd(), 'public/music', `${videoId}.mp3`);

    if (fs.existsSync(outputPath)) {
      return res.status(200).json({ link: `/music/${videoId}.mp3` });
    }

    const stream = ytdl(url, { quality: 'highestaudio' });
    
    ffmpeg(stream)
      .audioBitrate(128)
      .toFormat('mp3')
      .save(outputPath)
      .on('end', () => {
        res.status(200).json({ link: `/music/${videoId}.mp3` });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Error during conversion.' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to process your request.' });
  }
}
