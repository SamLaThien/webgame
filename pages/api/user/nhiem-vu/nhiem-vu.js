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
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    const missions = await new Promise((resolve, reject) => {
      db.query(
        `SELECT user_mission.id, user_mission.status, user_mission.count, user_mission.created_at, user_mission.endAt,
                user_mission.giftReceive, missions.detail, missions.prize, missions.time_limit, missions.contribution_points, missions.money, missions.type, missions.time_repeat
         FROM user_mission
         JOIN missions ON user_mission.mission_id = missions.id
         WHERE user_mission.user_id = ?  AND user_mission.status = 'on going'`,
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!missions || missions.length === 0) {
      return res.status(404);
      // .json({ message: "No missions found for this user" });
    }

    res.status(200).json({ missions: missions });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
}
