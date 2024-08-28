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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    db.query('SELECT * FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      const isInClan = results.length > 0;

      if (!isInClan) {
        db.query('UPDATE users SET clan_role = NULL WHERE id = ?', [userId], (updateError) => {
          if (updateError) {
            return res.status(500).json({ message: 'Internal server error', error: updateError.message });
          }
          return res.status(200).json({ isInClan });
        });
      } else {
        return res.status(200).json({ isInClan });
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
