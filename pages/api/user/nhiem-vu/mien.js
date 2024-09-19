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

  try {
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
        .json({ message: "Không tìm thấy nhiệm vụ cho tài khoản này" });
    }

    const [ruongDoItem] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM ruong_do WHERE user_id = ? AND vat_pham_id = 64`,
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!ruongDoItem) {
      return res
        .status(404)
        .json({ message: "Bạn cần có Hoà thị bích để miễn nhiệm vụ" });
    }

    if (ruongDoItem.length > 0) {
      const [updateRuongDo] = await new Promise((resolve, reject) => {
        db.query(
          "UPDATE ruong_do SET so_luong = so_luong - 1  WHERE vat_pham_id = 64 AND user_id = ?",
          [userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
      if (updateRuongDo.affectedRows === 0) {
        return res.status(404).json({ message: "Lỗi không xác định" });
      }
    }

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE user_mission SET status = "by pass", giftReceive = 1, endAt = NOW() WHERE id = ?',
        [missionId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    const activityLoc = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Bypass mission", ?, NOW())',
        [
          userId,
          `đã miễn nhiệm vụ đường thành công`,
          "đã miễn nhiệm vụ đường thành công",
        ],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
    res
      .status(200)
      .json({ success: true, message: "Miễn nhiệm vụ thành công" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
