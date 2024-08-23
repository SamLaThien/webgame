import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;  // Assuming userId is encoded in the JWT
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (req.method === 'POST') {
      // Your existing logic with the userId
      try {
        const queryGet = 'SELECT tai_san FROM users WHERE id = ?';
        db.query(queryGet, [userId], (error, results) => {
          if (error || results.length === 0) {
            return res.status(500).json({ message: 'Internal server error', error: error?.message || 'User not found' });
          }

          let currentTaiSan = results[0].tai_san;

          if (currentTaiSan < 1000) {
            return res.status(400).json({ message: 'Insufficient tai_san. You need at least 1000k to spin.' });
          }

          const newTaiSan = Math.max(0, currentTaiSan - 300);

          const queryUpdate = 'UPDATE users SET tai_san = ? WHERE id = ?';
          db.query(queryUpdate, [newTaiSan, userId], (error) => {
            if (error) {
              return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
            res.status(200).json({ message: 'Spin allowed', tai_san: newTaiSan });
          });
        });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
