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
      const { slot_number, spinToken } = req.body;

      if (!userId || !slot_number || !spinToken) {
        return res.status(400).json({ message: 'User ID, slot number, and spinToken are required' });
      }

      try {
        const spinDecoded = jwt.verify(spinToken, process.env.JWT_SECRET);
        if (!spinDecoded || spinDecoded.userId !== userId) {
          return res.status(403).json({ message: 'Invalid spin token' });
        }

        const queryGetItems = `
          SELECT option_text, prize_rate, item_id FROM wheel_slots WHERE slot_number = ?
        `;
        db.query(queryGetItems, [slot_number], (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          if (results.length === 0) {
            return res.status(404).json({ message: 'No items found for this slot number' });
          }

          let totalWeight = results.reduce((sum, item) => sum + item.prize_rate, 0);
          let randomNum = Math.random() * totalWeight;

          let selectedItem;
          for (let item of results) {
            if (randomNum < item.prize_rate) {
              selectedItem = item;
              break;
            }
            randomNum -= item.prize_rate;
          }

          if (!selectedItem || !selectedItem.item_id) {
            return res.status(404).json({ message: 'No valid item found for this slot number' });
          }

          const queryCheck = `
            SELECT id, so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?
          `;
          db.query(queryCheck, [userId, selectedItem.item_id], (checkError, checkResults) => {
            if (checkError) {
              return res.status(500).json({ message: 'Internal server error', error: checkError.message });
            }

            if (checkResults.length > 0) {
              const existingItem = checkResults[0];
              const newQuantity = existingItem.so_luong + 1;

              const queryUpdate = `
                UPDATE ruong_do SET so_luong = ? WHERE id = ?
              `;
              db.query(queryUpdate, [newQuantity, existingItem.id], (updateError) => {
                if (updateError) {
                  return res.status(500).json({ message: 'Internal server error', error: updateError.message });
                }
                res.status(200).json({ message: 'Item quantity updated successfully', item: selectedItem.option_text });
              });
            } else {
              const queryInsert = `
                INSERT INTO ruong_do (user_id, vat_pham_id, so_luong)
                VALUES (?, ?, 1)
              `;
              db.query(queryInsert, [userId, selectedItem.item_id], (insertError) => {
                if (insertError) {
                  return res.status(500).json({ message: 'Internal server error', error: insertError.message });
                }
                res.status(200).json({ message: 'Item added to Ruong Do successfully', item: selectedItem.option_text });
              });
            }
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
