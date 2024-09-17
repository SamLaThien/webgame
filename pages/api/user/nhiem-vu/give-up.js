import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }

  const { missionId } = req.body;

  if (!missionId) {
    return res.status(400).json({ message: "Mission ID is required" });
  }

  try {
    // Check if the mission exists for this user
    const [userMission] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM user_mission WHERE id = ? AND user_id = ?`,
        [missionId, userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!userMission) {
      return res
        .status(404)
        .json({ message: "Không timg thấy nhiệm vụ cho tài khoản này" });
    }

    const updateResult = await new Promise((resolve, reject) => {
      db.query(
        `UPDATE user_mission 
         SET status = 'failed' 
         WHERE id = ? AND user_id = ?`,
        [missionId, userId],
        (error, results) => {
          if (error) {
            // console.error("Error updating mission status:", error);
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Mission status not updated" });
    }

    const activityLoc = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Mission failed", ?, NOW())',
        [
          userId,
          `đã huỷ nhiệm vụ đường thành công`,
          "đã huỷ nhiệm vụ đường thành công",
        ],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    const clanIdResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT clan_id FROM clan_members WHERE member_id = ?",
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    res.status(200).json({
      success: true,
      message: "Đã huỷ nhiệm vụ thành công",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
