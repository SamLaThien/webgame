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
    const { slot_number, option_text, prize_rate, lower_bound, higher_bound, item_id, prize_type } = req.body;

    if (slot_number >= 1 && slot_number <= 4) {
      if (!option_text || !item_id || prize_rate === undefined) {
        return res.status(400).json({ message: 'option_text, item_id, and prize_rate are required for slot numbers 1-4' });
      }
    }

    try {
      if (slot_number >= 5 && slot_number <= 8) {
        const query = `UPDATE wheel_slots SET lower_bound = ?, higher_bound = ? WHERE id = ?`;
        await new Promise((resolve, reject) => {
          db.query(query, [lower_bound, higher_bound, id], (error) => {
            if (error) reject(error);
            resolve();
          });
        });
      } else {
        const query = `
          UPDATE wheel_slots
          SET option_text = ?, prize_rate = ?, lower_bound = ?, higher_bound = ?, item_id = ?, prize_type = ?
          WHERE id = ?
        `;
        await new Promise((resolve, reject) => {
          db.query(query, [option_text, prize_rate, lower_bound, higher_bound, item_id, prize_type, id], (error) => {
            if (error) reject(error);
            resolve();
          });
        });
      }

      res.status(200).json({ message: 'Wheel slot updated successfully' });
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
