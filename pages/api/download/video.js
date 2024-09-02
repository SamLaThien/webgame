import ytdl from 'ytdl-core';


export default async function handler(req, res) {
  const { link, stream } = req.query;

  if (!link) {
    return res.status(400).json({ message: "Please provide a valid link." });
  }

  try {
    const info = await ytdl.getInfo(link);

    if (stream) {
      const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // Video format
      res.setHeader('Content-Type', 'video/mp4');
      ytdl(link, { format }).pipe(res);
    } else {
      const result = {
        title: info.videoDetails.title,
        duration: new Date(Number(info.videoDetails.lengthSeconds) * 1000).toISOString().slice(11, 19),
        viewCount: info.videoDetails.viewCount,
        likes: info.videoDetails.likes,
        author: info.videoDetails.author.name,
        download: `${process.env.BASE_URL}/api/download/video?link=${link}&stream=true`
      };
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({ message: "Error downloading video", error: error.message });
  }
}
