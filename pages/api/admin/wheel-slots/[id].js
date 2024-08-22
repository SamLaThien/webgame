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

    if (!user || user.role !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (req.method === 'PUT') {
    const {
      slot_number,
      prize_type,
      prize_value,
      prize_range,
      prize_rate,
      item_id,
      option_text,
      background_color,
      text_color,
    } = req.body;

    const fieldsToUpdate = [];
    const values = [];

    if (slot_number !== undefined) {
      fieldsToUpdate.push('slot_number = ?');
      values.push(slot_number);
    }
    if (prize_type !== undefined) {
      fieldsToUpdate.push('prize_type = ?');
      values.push(prize_type);
    }
    if (prize_value !== undefined) {
      fieldsToUpdate.push('prize_value = ?');
      values.push(prize_value);
    }
    if (prize_range !== undefined) {
      fieldsToUpdate.push('prize_range = ?');
      values.push(prize_range);
    }
    if (prize_rate !== undefined) {
      fieldsToUpdate.push('prize_rate = ?');
      values.push(prize_rate);
    }
    if (item_id !== undefined) {
      fieldsToUpdate.push('item_id = ?');
      values.push(item_id);
    }
    if (option_text !== undefined) {
      fieldsToUpdate.push('option_text = ?');
      values.push(option_text);
    }
    if (background_color !== undefined) {
      fieldsToUpdate.push('background_color = ?');
      values.push(background_color);
    }
    if (text_color !== undefined) {
      fieldsToUpdate.push('text_color = ?');
      values.push(text_color);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
      const query = `UPDATE wheel_slots SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      values.push(id);
      db.query(query, values, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Wheel slot updated successfully' });
      });
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
