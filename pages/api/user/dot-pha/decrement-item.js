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
    // Verify the JWT token and extract the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { itemIds } = req.body;

    // If itemIds is null, undefined, or empty, skip the decrement operation
    if (!itemIds || itemIds.trim() === '') {
      return res.status(200).json({ message: 'No items to decrement.' });
    }

    const itemIdArray = itemIds.split(',').map(id => parseInt(id.trim(), 10));

    try {
      // Decrement the quantity of each item by 1 in the ruong_do table
      for (let itemId of itemIdArray) {
        const updateQuery = `
          UPDATE ruong_do 
          SET so_luong = CASE 
              WHEN so_luong > 1 THEN so_luong - 1
              ELSE 0
            END
          WHERE user_id = ? AND vat_pham_id = ?
        `;
        await new Promise((resolve, reject) => {
          db.query(updateQuery, [userId, itemId], (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      }

      return res.status(200).json({ message: 'Items decremented successfully.' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Error verifying token or processing request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
