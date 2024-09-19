import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const userLevel = user.level;
    const [ongoingMission] = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_mission WHERE user_id = ? AND status = "on going"',
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    const [levelDetails] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT thoi_gian_cho_giua_2_nhiem_vu FROM levels WHERE cap_so = ?",
        [userLevel],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    if (ongoingMission && levelDetails) {
      const lastMissionEndTime = new Date(ongoingMission.endAt).getTime();
      const currentTime = new Date().getTime();
      const timeSinceLastMissionEnd = (currentTime - lastMissionEndTime) / (1000 * 60 * 60);
      const waitingTimeBetweenMissions = levelDetails.thoi_gian_cho_giua_2_nhiem_vu;

      if (timeSinceLastMissionEnd < waitingTimeBetweenMissions) {
        let timeRemaining = (waitingTimeBetweenMissions - timeSinceLastMissionEnd).toFixed(2);
        const hoursDifference = Math.floor(timeRemaining / 1);
        let time = hoursDifference + " giờ ";
        let temp = timeRemaining;
        while (temp >= 1) {
          temp--;
        }
        if (temp > 0) {
          time = time + (temp * 60).toFixed(0) + " phút ";
        }
        let messageMisstion = `Đạo hữu đã trả nhiệm vụ trong ngày vui lòng nhận nhiệm vụ trong ${time} tới`;
        return res.status(200).json({ message: messageMisstion });
      }
    }
    return res
      .status(400)
      .json({ message: "Lỗi Không xác định", error: error.message });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
}
