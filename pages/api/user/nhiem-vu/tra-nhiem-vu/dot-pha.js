import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const ongoingMission = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_mission WHERE user_id = ? AND mission_id = 3 AND status = "on going" AND endAt > NOW()',
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (ongoingMission) {
      const [user] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT level FROM users WHERE id = ?",
          [userId],
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
      if (!user) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }
      var level = user.level - ongoingMission.note;
      if (level >= 1) {
        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE user_mission SET count = count + 1 WHERE id = ?",
            [ongoingMission.id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        return res.status(200).json({ message: "Thành công" });
      } else {
        return res
          .status(404)
          .json({ message: "Không thể thực thi yêu cầu của bạn" });
      }
    } else {
      return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
}
