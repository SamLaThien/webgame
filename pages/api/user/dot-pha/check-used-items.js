import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }

  const { userId, usedItemIds } = req.query;

  if (!userId || !usedItemIds) {
    return res.status(400).json({ message: 'User ID and used item IDs are required' });
  } 

  const usedItemIdArray = usedItemIds.split(',').map(id => parseInt(id.trim(), 10));

  try {
    const query = `
      SELECT vat_pham_id, so_luong FROM ruong_do 
      WHERE user_id = ? AND vat_pham_id IN (?) AND so_luong > 0
    `;
    db.query(query, [userId, usedItemIdArray], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
