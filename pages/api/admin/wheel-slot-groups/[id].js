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

  if (req.method === 'GET') {
    try {
      const query = 'SELECT * FROM wheel_slot_groups WHERE id = ?';
      db.query(query, [id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(results[0]);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { slot_number, group_name, background_color, text_color } = req.body;

    // Dynamic query building for partial updates
    const fieldsToUpdate = [];
    const values = [];

    if (slot_number !== undefined) {
      fieldsToUpdate.push('slot_number = ?');
      values.push(slot_number);
    }
    if (group_name !== undefined) {
      fieldsToUpdate.push('group_name = ?');
      values.push(group_name);
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
      const query = `UPDATE wheel_slot_groups SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      values.push(id);
      db.query(query, values, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Group updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const query = 'DELETE FROM wheel_slot_groups WHERE id = ?';
      db.query(query, [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
