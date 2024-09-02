import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
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
         WHERE user_mission.user_id = ?`,
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!missions || missions.length === 0) {
      return res.status(404).json({ message: 'No missions found for this user' });
    }

    const now = new Date();

    const updatedMissions = await Promise.all(
      missions.map(async (mission) => {
        const missionEndTime = new Date(mission.endAt);
        let isFinish = false;

        if (mission.status === 'on going' && mission.count >= mission.time_repeat && now <= missionEndTime) {
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE user_mission SET status = 'success' WHERE id = ?`,
              [mission.id],
              (error) => {
                if (error) {
                  console.error('Error updating mission status to success:', error);
                  reject(error);
                } else {
                  resolve();
                }
              }
            );
          });
          isFinish = true;
        } else if (mission.status === 'on going' && now > missionEndTime && mission.count < mission.time_repeat) {
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE user_mission SET status = 'failed' WHERE id = ?`,
              [mission.id],
              (error) => {
                if (error) {
                  console.error('Error updating mission status to failed:', error);
                  reject(error);
                } else {
                  resolve();
                }
              }
            );
          });
          isFinish = true;
        } else if (mission.status === 'success' || mission.status === 'failed') {
          isFinish = true;
        }

        return { ...mission, isFinish };
      })
    );

    res.status(200).json({ missions: updatedMissions });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}
