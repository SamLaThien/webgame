import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { method } = req;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let adminId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    adminId = decoded.userId;

    const [admin] = await new Promise((resolve, reject) => {
      db.query('SELECT role FROM users WHERE id = ?', [adminId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (!admin || parseInt(admin.role) !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (method === 'POST') {
    const { userId, danhHao, css } = req.body;

    if (!userId || !danhHao) {
      return res.status(400).json({ message: 'User ID and Danh Hào are required' });
    }

    try {
      db.query(
        'INSERT INTO user_danh_hao (user_id, danh_hao,css) VALUES (?, ?,?)',
        [userId, danhHao, css],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          res.status(201).json({ id: results.insertId, danh_hao: danhHao });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
