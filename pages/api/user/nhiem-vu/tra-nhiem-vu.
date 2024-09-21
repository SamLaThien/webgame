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
    const { missionId } = req.body;

    if (!missionId) {
      return res.status(400).json({ message: "Mission ID is required" });
    }

    const userMission = await queryDB(
      "SELECT * FROM user_mission WHERE id = ? AND user_id = ? AND giftReceive = false",
      [missionId, userId]
    );
    if (!userMission.length) {
      return res.status(404).json({ message: "Không tìm thấy nhiệm vụ nhận quà" });
    }

    const user = await queryDB("SELECT level, exp FROM users WHERE id = ?", [userId]);
    if (!user.length) {
      return res.status(404).json({ message: "Không tìm thấy account" });
    }

    const [timeLimit] = await queryDB("SELECT * FROM missions WHERE id = ?", [userMission[0].mission_id]);

    const lastMissionStart = new Date(userMission[0].created_at).getTime();
    const currentTime = Date.now();
    const timeSinceLastMissionEnd = (currentTime - lastMissionStart) / (1000 * 60 * 60);

    if (timeSinceLastMissionEnd > timeLimit.time_limit) {
      await updateDB(
        "UPDATE user_mission SET status = 'failed', endAt = NOW() WHERE id = ? AND user_id = ?",
        [missionId, userId]
      );
      return res.status(404).json({ message: "Nhiệm vụ của bạn đã quá hạn" });
    }

    const mission = await queryDB("SELECT * FROM missions WHERE id = ?", [userMission[0].mission_id]);
    if (!mission) {
      return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
    }

    if (userMission[0].mission_id === 1) {
      if (userMission[0].count >= mission.time_repeat) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ. (Vui lòng quay thêm ít nhất ${mission.time_repeat - userMission[0].count} vòng nữa)`, success: false });
      }
    } else if (userMission[0].mission_id === 3) {
      const levelData = user[0].level - userMission[0].note;
      if (levelData >= 1) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ.(Vui lòng tăng thêm ít nhất ${1 - levelData} cấp nữa)`, success: false });
      }
    } else if (userMission[0].mission_id === 4) {
      const expData = user[0].exp - userMission[0].note;
      if (expData >= 5000) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ (Vui lòng tăng thêm ít nhất ${5000 - expData} điểm kinh nghiệm nữa.`, success: false });
      }
    }

  } catch (error) {
    console.error("Error claiming reward:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

function queryDB(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function updateUserAndMission(userId, mission, userMissionId) {
  await updateDB(
    "UPDATE users SET tai_san = tai_san + ?, clan_contribution_points = clan_contribution_points + ?, nvd_count = nvd_count + 1 WHERE id = ?",
    [mission.money, mission.contribution_points, userId]
  );

  await updateDB(
    'UPDATE user_mission SET status = "success", giftReceive = 1, endAt = NOW() WHERE id = ?',
    [userMissionId]
  );

  const user = await queryDB("SELECT ngoai_hieu, username FROM users WHERE id = ?", [userId]);
  const { ngoai_hieu, username } = user[0];
  const displayName = ngoai_hieu || username;
  const userLink = `<a href="https://tuchangioi.xyz/member/${userId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;
  const actionDetails = `${userLink} làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission.contribution_points} điểm cống hiến`;

  const clanIdResult = await queryDB("SELECT clan_id FROM clan_members WHERE member_id = ?", [userId]);
  if (clanIdResult.length) {
    const clanId = clanIdResult[0].clan_id;
    await updateDB("UPDATE clans SET contribution_points = contribution_points + ? WHERE id = ?", [mission.contribution_points, clanId]);
    await logClanActivity(userId, clanId, actionDetails);
    await logUserActivity(userId, actionDetails);
  }
}

function updateDB(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function logClanActivity(userId, clanId, actionDetails) {
  await updateDB(
    'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp) VALUES (?, ?, "Mission Completed", ?, NOW())',
    [userId, clanId, actionDetails]
  );
}

async function logUserActivity(userId, actionDetails) {
  await updateDB(
    'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Mission Completed", ?, NOW())',
    [userId, actionDetails]
  );
}
