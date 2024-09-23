import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { checkAccount, addBac } from '/var/www/bot/addBac.js';
import { addLogs } from '/var/www/bot/logs.js';

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
    if (!mission.length) {
      return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
    }

    if (userMission[0].mission_id === 1) {
      if (userMission[0].count >= mission[0].time_repeat) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ. (Vui lòng quay thêm ít nhất ${mission[0].time_repeat - userMission[0].count} vòng nữa)`, success: false });
      }
    } else if (userMission[0].mission_id === 3) {
      const levelData = user[0].level - userMission[0].note;
      if (levelData >= 1) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ. (Vui lòng tăng thêm ít nhất ${1 - levelData} cấp nữa)`, success: false });
      }
    } else if (userMission[0].mission_id === 4) {
      const expData = user[0].exp - userMission[0].note;
      if (expData >= 5000) {
        await updateUserAndMission(userId, mission, userMission[0].id);
        return res.status(200).json({ message: "Chúc mừng đạo hữu đã hoàn thành nhiệm vụ", success: true });
      } else {
        return res.status(200).json({ message: `Bạn chưa hoàn thành nhiệm vụ (Vui lòng tăng thêm ít nhất ${5000 - expData} điểm kinh nghiệm nữa).`, success: false });
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
  const data = await checkAccount(userId);
  if (!data || data.length === 0) {
    throw new Error("Account not found.");
  }

  const { ngoai_hieu, username, nvd_count } = data[0];
  const chuoi_money = await checkBonus(nvd_count);
  const new_bac = mission[0].money + chuoi_money;

  await updateDB(
    "UPDATE users SET tai_san = tai_san + ?, clan_contribution_points = clan_contribution_points + ?, nvd_count = nvd_count + 1 WHERE id = ?",
    [new_bac, mission[0].contribution_points, userId]
  );

  const displayName = ngoai_hieu || username;
  const userLink = `<a href="https://tuchangioi.xyz/member/${userId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;
  const actionDetails = `${userLink} làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission[0].contribution_points} điểm cống hiến.`;
  const action = `${userLink} làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission[0].contribution_points} điểm cống hiến và ${new_bac} bạc`;
  await logUserActivity(userId, action);
  await addLogs(`${displayName} làm nhiệm vụ tại Nhiệm Vụ Đường thu được ${mission[0].contribution_points} điểm cống hiến và ${new_bac} bạc`);

  const clanIdResult = await queryDB("SELECT clan_id FROM clan_members WHERE member_id = ?", [userId]);
  if (clanIdResult.length) {
    const clanId = clanIdResult[0].clan_id;
    await updateDB("UPDATE clans SET contribution_points = contribution_points + ? WHERE id = ?", [mission[0].contribution_points, clanId]);
    await logClanActivity(userId, clanId, actionDetails);

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

async function checkBonus(n) {
  if (n > 0 && n % 50 === 0) {
    return 50000 * (n / 50);
  }
  return 0;
}
