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

  const { userId, itemIds } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!itemIds || itemIds.trim() === '') {
    return res.status(200).json({ hasRequiredItems: true });
  }

  const itemIdArray = itemIds.split(',').map(id => {
    const parsedId = parseInt(id.trim(), 10);
    return isNaN(parsedId) ? null : parsedId;
  }).filter(id => id !== null);

  if (itemIdArray.length === 0) {
    return res.status(400).json({ message: 'Invalid item IDs provided' });
  }

  try {
    const query = `
      SELECT vat_pham_id, so_luong FROM ruong_do 
      WHERE user_id = ? AND vat_pham_id IN (?) AND so_luong > 0
    `;
    db.query(query, [userId, itemIdArray], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      const userHasAllItems = itemIdArray.every(id => 
        results.some(item => item.vat_pham_id === id && item.so_luong > 0)
      );

      return res.status(200).json({ hasRequiredItems: userHasAllItems });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
