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
      console.log("Received values:", { userId, slot_number, spinToken });

      if (!userId || !slot_number || !spinToken) {
        return res.status(400).json({ message: 'User ID, slot number, and spin token are required' });
      }

      if (!spinToken) { 
        return res.status(403).json({ message: 'Invalid or already used spin token' });
      }

      try {
        const queryGetSlot = `
          SELECT lower_bound, higher_bound
          FROM wheel_slots
          WHERE slot_number = ?
          LIMIT 1
        `;
        db.query(queryGetSlot, [slot_number], (error, results) => {
          if (error || results.length === 0) {
            return res.status(500).json({ message: 'Internal server error', error: error?.message || 'Slot not found' });
          }

          const { lower_bound, higher_bound } = results[0];

          if (lower_bound === null || higher_bound === null) {
            return res.status(400).json({ message: 'Invalid range for the selected slot' });
          }

          const amount = Math.floor(Math.random() * (higher_bound - lower_bound + 1)) + lower_bound;

          let field, operation;
          switch (slot_number) {
            case 5: 
              field = 'exp';
              operation = '-';
              break;
            case 6: 
              field = 'exp';
              operation = '+';
              break;
            case 7: 
              field = 'tai_san';
              operation = '+';
              break;
            case 8: 
              field = 'tai_san';
              operation = '-';
              break;
            default:
              return res.status(400).json({ message: 'Invalid slot number for exp or money prize' });
          }

          const queryGet = `SELECT ${field} FROM users WHERE id = ?`;
          db.query(queryGet, [userId], (error, results) => {
            if (error || results.length === 0) {
              return res.status(500).json({ message: 'Internal server error', error: error?.message || 'User not found' });
            }

            let currentValue = results[0][field];
            let newValue;

            if (operation === '-') {
              newValue = Math.max(0, currentValue - amount); 
            } else {
              newValue = currentValue + amount;
            }

            const queryUpdate = `UPDATE users SET ${field} = ? WHERE id = ?`;
            db.query(queryUpdate, [newValue, userId], (updateError) => {
              if (updateError) {
                return res.status(500).json({ message: 'Internal server error', error: updateError.message });
              }
              res.status(200).json({ message: 'User updated successfully', prize: amount });
            });
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
