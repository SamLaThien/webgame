import db from "@/lib/db";
import jwt from "jsonwebtoken";
import moment from "moment";

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

    const { missionId } = req.body;

    if (!missionId) {
      return res.status(400).json({ message: "Mission ID is required" });
    }

    const userMission = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user_mission WHERE id = ? AND user_id = ? AND giftReceive = false",
        [missionId, userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!userMission) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy nhiệm vụ nhận quà" });
    }
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
      return res.status(404).json({ message: "Không tìm thấy account" });
    }


    const [timeLimit] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM missions WHERE id = ?",
        [userMission.mission_id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!timeLimit) {
      return res.status(404).json({ message: "Lỗi không xác định" });
    }
    const lastMissionStart = new Date(userMission.created_at).getTime();
    const currentTime = new Date().getTime();
    const timeSinceLastMissionEnd =
    (currentTime - lastMissionStart) / (1000 * 60 * 60);
    if (timeSinceLastMissionEnd > timeLimit.time_limit) {
      const updateResult = await new Promise((resolve, reject) => {
        db.query(
          `UPDATE user_mission 
           SET status = 'failed',
               endAt = NOW()
           WHERE id = ? AND user_id = ?`,
          [missionId, userId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
      return res.status(404).json({ message: "Nhiệm vụ của bạn đã quá hạn" });
    }

    const mission = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM missions WHERE id = ?",
        [userMission.mission_id],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!mission) {
      return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
    }

    if (userMission.count >= mission.time_repeat) {
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE users SET tai_san = tai_san + ?, clan_contribution_points = clan_contribution_points + ? WHERE id = ?",
          [mission.money, mission.contribution_points, userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user_mission SET status = "success", giftReceive = 1,endAt = NOW() WHERE id = ?',
          [userMission.id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      const user = await new Promise((resolve, reject) => {
        db.query(
          "SELECT ngoai_hieu, username FROM users WHERE id = ?",
          [userId],
          (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
          }
        );
      });

      const { ngoai_hieu, username } = user;
      const displayName = ngoai_hieu || username;
      const userLink = `<a href="https://tuchangioi.xyz/member/${userId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;
      const actionDetails = `${userLink} làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission.contribution_points} điểm cống hiến`;

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

      if (clanIdResult) {
        const clanId = clanIdResult.clan_id;

        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE clans set contribution_points = contribution_points + ? WHERE id = ?",
            [mission.contribution_points, clanId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp) VALUES (?, ?, "Mission Completed", ?, NOW())',
            [userId, clanId, actionDetails],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Mission Completed", ?, NOW())',
            [
              userId,
              `làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission.contribution_points} điểm cống hiến`,
              actionDetails,
            ],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      return res
        .status(200)
        .json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ" });
    } else {
      return res.status(400).json({ message: "Bạn chưa hoàn thành nhiệm vụ" });
    }
  } catch (error) {
    console.error("Error claiming reward:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
