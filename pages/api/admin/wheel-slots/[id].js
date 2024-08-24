import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT role FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (!user || parseInt(user.role) !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (req.method === 'PUT') {
    const { items, slot_number } = req.body;  // Ensure slot_number is extracted

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    try {
      // Fetch the prize_type from one of the existing items in the same slot_number
      const [existingItem] = await new Promise((resolve, reject) => {
        const query = 'SELECT prize_type FROM wheel_slots WHERE slot_number = ? LIMIT 1';
        db.query(query, [slot_number], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });

      const prize_type = existingItem ? existingItem.prize_type : null;

      for (const item of items) {
        const { id: itemId, option_text, prize_rate, lower_bound, higher_bound, item_id } = item;

        if (itemId < 1000) { // Assume IDs lower than a certain value are existing and should be updated
          const fieldsToUpdate = [];
          const values = [];

          if (slot_number !== undefined) {
            fieldsToUpdate.push('slot_number = ?');
            values.push(slot_number);
          }
          if (option_text !== undefined) {
            fieldsToUpdate.push('option_text = ?');
            values.push(option_text);
          }
          if (prize_rate !== undefined) {
            fieldsToUpdate.push('prize_rate = ?');
            values.push(prize_rate);
          }
          if (lower_bound !== undefined) {
            fieldsToUpdate.push('lower_bound = ?');
            values.push(lower_bound);
          }
          if (higher_bound !== undefined) {
            fieldsToUpdate.push('higher_bound = ?');
            values.push(higher_bound);
          }
          if (item_id !== undefined) {
            fieldsToUpdate.push('item_id = ?');
            values.push(item_id);
          }

          const query = `UPDATE wheel_slots SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
          values.push(itemId);  // Use the correct item ID

          await new Promise((resolve, reject) => {
            db.query(query, values, (error) => {
              if (error) reject(error);
              resolve();
            });
          });
        } else {
          // Ensure slot_number and prize_type are passed correctly in the insert query
          const insertQuery = `
            INSERT INTO wheel_slots (slot_number, option_text, prize_rate, lower_bound, higher_bound, item_id, prize_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            db.query(insertQuery, [slot_number, option_text, prize_rate, lower_bound, higher_bound, item_id, prize_type], (error) => {
              if (error) reject(error);
              resolve();
            });
          });
        }
      }

      res.status(200).json({ message: 'Wheel slot updated or inserted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const query = 'DELETE FROM wheel_slots WHERE id = ?';
      db.query(query, [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Wheel slot deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


