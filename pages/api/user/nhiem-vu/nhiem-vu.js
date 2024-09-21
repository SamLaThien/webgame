import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    // Fetching missions
    const missions = await new Promise((resolve, reject) => {
      db.query(
        `SELECT user_mission.id,  user_mission.created_at, user_mission.endAt,
               missions.detail, missions.prize, missions.time_limit, missions.contribution_points, missions.money, missions.type, missions.time_repeat
         FROM user_mission
         JOIN missions ON user_mission.mission_id = missions.id
         WHERE user_mission.user_id = ?  AND user_mission.status = 'on going'`,
        [userId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    const userDetails = await new Promise((resolve, reject) => {
      db.query(
        `SELECT nvd_count FROM users WHERE id = ?;`,
        [userId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });
    // Respond with missions found
    return res.status(200).json({ missions, userDetails });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
}
