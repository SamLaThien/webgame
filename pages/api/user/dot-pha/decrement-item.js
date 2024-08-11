import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, itemIds } = req.body;

  if (!userId || !itemIds) {
    return res.status(400).json({ message: 'User ID and item IDs are required' });
  }

  const itemIdArray = itemIds.split(',').map(id => parseInt(id.trim(), 10)); // Convert the string to an array of integers

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
}
