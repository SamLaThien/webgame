import jwt from 'jsonwebtoken';
import db from '@/lib/db';

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
    const { actionType, actionDetails } = req.body;

    if (!actionType || !actionDetails) {
      return res.status(400).json({ message: 'Action type and action details are required' });
    }

    const userId = decoded.userId;

    const userActivityQuery = `
      INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(userActivityQuery, [userId, actionType, actionDetails], (error) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      return res.status(200).json({ message: 'User activity logged successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
