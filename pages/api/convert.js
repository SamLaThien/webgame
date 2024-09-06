import { createWriteStream } from "fs";
import { join } from "path";
import { parse } from "url";
import ytdl from "ytdl-core";

export const config = {
  api: {
    bodyParser: true, 
  },
};

const header = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url: videoURL } = req.body;
    if (!videoURL) {
      return res.status(400).json({ error: "No URL provided" });
    }

    let videoName = videoURL;
    if (videoURL.includes("https://")) {
      const urlParts = parse(videoURL, true);
      videoName = urlParts.query.v;
    }

    const videoStream = ytdl(videoURL, {
      requestOptions: header,
      filter: "audioonly",
    });

    const filePath = join(process.cwd(), "public", "output", `${videoName}.mp3`);
    const output = createWriteStream(filePath);

    videoStream.pipe(output);

    videoStream.on("progress", (chunkLength, downloaded, total) => {
      const percent = ((downloaded / total) * 100).toFixed(2);
      console.log(`Audio download: ${percent}%`);
    });

    videoStream.on("error", (err) => {
      return res.status(500).json({ error: "Error downloading audio", details: err });
    });

    output.on("finish", () => {
      const baseURL = req.headers.origin;
      res.status(200).json({
        audioLink: `${baseURL}/output/${videoName}.mp3`,
      });
    });

    output.on("error", (err) => {
      return res.status(500).json({ error: "Error saving audio", details: err });
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred", details: error.message });
  }
}
