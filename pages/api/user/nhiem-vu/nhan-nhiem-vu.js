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
      return res.status(404).json({ message: "User not found" });
    }

    const userLevel = user.level;

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

    if (!levelDetails) {
      return res.status(404).json({ message: "Level details not found" });
    }

    const waitingTimeBetweenMissions =
      levelDetails.thoi_gian_cho_giua_2_nhiem_vu;

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

    if (ongoingMission) {
      return res.status(400).json({
        message:
          "Bạn đã có một nhiệm vụ đang thực hiện. Vui lòng hoàn thành nhiệm vụ đó trước khi thực hiện nhiệm vụ mới.",
      });
    }

    const [recentMission] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT endAt FROM user_mission WHERE user_id = ? ORDER BY endAt DESC LIMIT 1",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (recentMission && recentMission.endAt) {
      const lastMissionEndTime = new Date(recentMission.endAt).getTime();
      const currentTime = new Date().getTime();
      const timeSinceLastMissionEnd = (currentTime - lastMissionEndTime) / (1000 * 60 * 60);

      if (timeSinceLastMissionEnd < waitingTimeBetweenMissions) {
        let timeRemaining = (waitingTimeBetweenMissions - timeSinceLastMissionEnd) * 60; // Chuyển đổi giờ sang phút
        timeRemaining = Math.floor(timeRemaining); // Làm tròn xuống

        let messageMisstion = `Đạo hữu đã nhận nhiệm vụ trong ngày, vui lòng chờ thêm ${timeRemaining} nhút nữa để nhận nhiệm vụ mới `;
        return res.status(200).json({ message: messageMisstion });
      }
    }


    const [mission] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM missions WHERE id IN (1, 3, 4) ORDER BY RAND() LIMIT 1",
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!mission) {
      return res.status(404).json({ message: "No missions available" });
    }

    const endAt = new Date();
    endAt.setHours(endAt.getHours() + mission.time_limit);

    if (mission.id === 4) {
      const [user] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT exp FROM users WHERE id = ?",
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
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO user_mission (user_id, mission_id, count, status, contribution_points, money, type, endAt, note) VALUES (?, ?, 0, "on going", ?, ?, ?, ?, ?)',
          [
            userId,
            mission.id,
            mission.contribution_points,
            mission.money,
            mission.type,
            endAt,
            user.exp,
          ],
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
    } else if (mission.id === 3) {
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
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO user_mission (user_id, mission_id, count, status, contribution_points, money, type, endAt, note) VALUES (?, ?, 0, "on going", ?, ?, ?, ?, ?)',
          [
            userId,
            mission.id,
            mission.contribution_points,
            mission.money,
            mission.type,
            endAt,
            user.level,
          ],
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
    } else if (mission.id === 1) {
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO user_mission (user_id, mission_id, count, status, contribution_points, money, type, endAt) VALUES (?, ?, 0, "on going", ?, ?, ?, ?)',
          [
            userId,
            mission.id,
            mission.contribution_points,
            mission.money,
            mission.type,
            endAt,
          ],
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
    }

    const logMessage = `đã nhận nhiệm vụ "${mission.detail}"`;
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Received Mission", ?, NOW())',
        [userId, logMessage],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    res.status(201).json({ message: "Bạn đã nhận nhiệm vụ" });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
}
