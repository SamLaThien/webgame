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
    const userId = decoded.userId; 

    if (req.method === 'POST') {
      const { vat_pham_id, so_luong } = req.body;

      if (!userId || !vat_pham_id || !so_luong) {
        return res.status(400).json({ message: 'User ID, Vat Pham ID, and quantity are required' });
      }

      try {
        const queryCheck = `
          SELECT id, so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?
        `;
        db.query(queryCheck, [userId, vat_pham_id], (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          if (results.length > 0) {
            // Item already exists, update the quantity
            const existingItem = results[0];
            const newQuantity = existingItem.so_luong + so_luong;

            const queryUpdate = `
              UPDATE ruong_do SET so_luong = ? WHERE id = ?
            `;
            db.query(queryUpdate, [newQuantity, existingItem.id], (updateError) => {
              if (updateError) {
                return res.status(500).json({ message: 'Internal server error', error: updateError.message });
              }
              res.status(200).json({ message: 'Item quantity updated successfully' });
            });
          } else {
            // Item does not exist, insert a new record
            const queryInsert = `
              INSERT INTO ruong_do (user_id, vat_pham_id, so_luong)
              VALUES (?, ?, ?)
            `;
            db.query(queryInsert, [userId, vat_pham_id, so_luong], (insertError) => {
              if (insertError) {
                return res.status(500).json({ message: 'Internal server error', error: insertError.message });
              }
              res.status(200).json({ message: 'Item added to Ruong Do successfully' });
            });
          }
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
