import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const ongoingMission = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_mission WHERE user_id = ? AND status = "on going" AND endAt > NOW() LIMIT 1',
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (ongoingMission) {
      return res.status(200).json({ missionId: ongoingMission.mission_id });
    } else {
      return res.status(404);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}
