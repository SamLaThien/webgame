import ytdl from 'ytdl-core';


export default async function handler(req, res) {
  const { link, stream } = req.query;

  if (!link) {
    return res.status(400).json({ message: "Please provide a valid link." });
  }

  try {
    const info = await ytdl.getInfo(link);

    if (stream) {
      const format = ytdl.chooseFormat(info.formats, { quality: '249' }); 
      res.setHeader('Content-Type', 'audio/mpeg');
      ytdl(link, { format }).pipe(res);
    } else {
      const result = {
        title: info.videoDetails.title,
        duration: new Date(Number(info.videoDetails.lengthSeconds) * 1000).toISOString().slice(11, 19),
        viewCount: info.videoDetails.viewCount,
        likes: info.videoDetails.likes,
        author: info.videoDetails.author.name,
        download: `${process.env.BASE_URL}/api/download/audio?link=${link}&stream=true`
      };
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error downloading audio:", error);
    res.status(500).json({ message: "Error downloading audio", error: error.message });
  }
}
