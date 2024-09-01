import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { missionId } = req.body;  

    if (!missionId) {
      return res.status(400).json({ message: 'Mission ID is required' });
    }

    const userMission = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_mission WHERE id = ? AND user_id = ? AND giftReceive = false',
        [missionId, userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!userMission) {
      return res.status(404).json({ message: 'No ongoing mission found' });
    }

    const mission = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM missions WHERE id = ?',
        [userMission.mission_id],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    if (userMission.count >= mission.time_repeat) {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE users SET tai_san = tai_san + ?, clan_contribution_points = clan_contribution_points + ? WHERE id = ?',
          [mission.money, mission.contribution_points, userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user_mission SET status = "success", giftReceive = 1 WHERE id = ?',
          [userMission.id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      return res.status(200).json({ message: 'Reward claimed successfully' });
    } else {
      return res.status(400).json({ message: 'Mission not completed yet' });
    }
  } catch (error) {
    console.error('Error claiming reward:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
