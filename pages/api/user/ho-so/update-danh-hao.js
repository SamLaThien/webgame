import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, selectedDanhHao } = req.body;

    if (!userId || !selectedDanhHao) {
      return res.status(400).json({ message: 'User ID and selected danh hao are required' });
    }

    const checkQuery = 'SELECT * FROM user_danh_hao WHERE user_id = ? AND danh_hao = ?';
    db.query(checkQuery, [userId, selectedDanhHao], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid danh hao selection' });
      }

      const updateQuery = 'UPDATE users SET danh_hao = ? WHERE id = ?';
      db.query(updateQuery, [selectedDanhHao, userId], (updateError) => {
        if (updateError) {
          return res.status(500).json({ message: 'Internal server error', error: updateError.message });
        }
        res.status(200).json({ message: 'Danh hao updated successfully' });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
