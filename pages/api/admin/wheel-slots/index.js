import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (req.method === 'GET') {
    try {
      const query = 'SELECT * FROM wheel_slots';
      db.query(query, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { slot_number, prize_type, lower_bound, higher_bound, prize_rate, item_id, option_text } = req.body;

    // Check for required fields based on prize_type
    if (prize_type === "2" && (!option_text || !item_id || !prize_rate)) {
      return res.status(400).json({ message: 'Required fields for item prize are missing' });
    }

    if (prize_type === "1" && (!lower_bound || !higher_bound)) {
      return res.status(400).json({ message: 'Required fields for range prize are missing' });
    }

    try {
      const [user] = await new Promise((resolve, reject) => {
        db.query('SELECT role FROM users WHERE id = ?', [userId], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });

      if (!user || parseInt(user.role) !== 1) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const query = `
        INSERT INTO wheel_slots 
        (slot_number, prize_type, lower_bound, higher_bound, prize_rate, item_id, option_text) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [slot_number, prize_type, lower_bound, higher_bound, prize_rate, item_id, option_text];
      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(201).json({ message: 'Wheel slot created successfully', id: results.insertId });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
