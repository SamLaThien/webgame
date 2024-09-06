import db from "@/lib/db";
import jwt from "jsonwebtoken";
import moment from "moment";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { mineAt, hour } = req.body;

    if (!mineAt || !hour) {
      return res.status(400).json({ message: "mineAt and hour are required" });
    }

    const [activeMining] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user_mine WHERE user_id = ? AND isDone = 0",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (activeMining) {
      return res.status(400).json({ message: "You are already mining. Please finish your current session before starting a new one." });
    }

    const currentTime = moment();
    const endAt = currentTime.add(hour, "hours").format("YYYY-MM-DD HH:mm:ss");

    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO user_mine (user_id, mineAt, hour, createAt, endAt, isDone) VALUES (?, ?, ?, NOW(), ?, 0)",
        [userId, mineAt, hour, endAt],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    const [mineData] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as miningCount FROM user_mine WHERE mineAt = ? AND isDone = 0",
        [mineAt],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    return res.status(200).json({
      message: "Mining started successfully",
      endAt,
      miningCount: mineData.miningCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
