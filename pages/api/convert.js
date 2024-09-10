import fs from "fs";
import path from "path";
import { parse } from "url";
import ytdl from "ytdl-core";
export const config = {
  api: {
    bodyParser: true,
  },
};

var header = {
  "User-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  "cookie": "",
};

export default async function handler(req, res) {
  const videoURL = req.query.url;
  if (!videoURL) {
    return res.status(400).json({ error: "No URL provided" });
  }

  let videoName = videoURL;
  if (videoURL.includes("/")) {
    const urlParts = parse(videoURL, true);
    videoName = urlParts.query.v;
  }

  try {
    const outputPath = path.join(process.cwd(), 'public/musics', `${videoName}.mp3`);
    
    // Kiểm tra nếu file đã tồn tại
    if (fs.existsSync(outputPath)) {
      return res.json({ audioLink: `https://tuchangioi.xyz/musics/${videoName}.mp3` });
    }

    const videoStream = ytdl(videoURL, {
      requestOptions: {
        headers: {
          cookie: "_Secure-1PSIDTS=sidts-CjEBUFGohxubcj9duGAy1dMYhFxcfXIPSYeshqzSEgchYLDaRUBEPBSO6XYTKINEZEAJ; _Secure-3PSIDTS=sidts-CjEBUFGohxubcj9duGAy1dMYhFxcfXIPSYeshqzSEgchYLDaRUBEPBSO6XYTKINEZEAJ; HSID=A8xWIplcOcvpSUHZH; S",
        },
      },
      filter: "audioonly",
    });
    const output = fs.createWriteStream(outputPath);

    videoStream.pipe(output);

    videoStream.on("progress", (chunkLength, downloaded, total) => {
      const percent = ((downloaded / total) * 100).toFixed(2);
      console.log(`Audio download: ${percent}%`);
    });

    videoStream.on("error", (err) => {
      fs.unlinkSync(outputPath);
      return res.status(500).json({ error: "Error downloading audio", details: err });
    });

    output.on("finish", () => {
      res.status(200).json({ audioLink: `https://tuchangioi.xyz/musics/${videoName}.mp3` });
    });

    output.on("error", (err) => {
      fs.unlinkSync(outputPath);
      return res.status(500).json({ error: "Error saving audio", details: err });
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred", details: error });
  }
}
