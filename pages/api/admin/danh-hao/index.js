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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID and danh hao are required' });
    }

    try {
      db.query('SELECT * FROM user_danh_hao WHERE user_id = ?', [userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
          return res.status(200).json({ message: 'No danh hào found for this user' });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }

  } else if (method === 'DELETE') {
    const { userId, danhHaoId, danh_hao } = req.body;

    if (!userId || !danhHaoId || !danh_hao) {
      return res.status(400).json({ message: 'User ID, Danh Hào ID, and Danh Hào are required' });
    }

    try {
      const rows = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ? AND danh_hao = ?', [userId, danh_hao], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });

      if (rows && rows.length > 0) {
        await new Promise((resolve, reject) => {
          db.query('UPDATE users SET danh_hao = "Active User" WHERE id = ? AND danh_hao = ?', [userId, danh_hao], (error) => {
            if (error) return reject(error);
            resolve();
          });
        });
      }

      await new Promise((resolve, reject) => {
        db.query('DELETE FROM user_danh_hao WHERE id = ?', [danhHaoId], (error) => {
          if (error) return reject(error);
          resolve();
        });
      });

      res.status(200).json({ message: 'Danh hào deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


  else if (method === 'PUT') {
    const { userId, danhHaoId, newDanhHao, oldDanhHao, css } = req.body;
    if (!userId || !danhHaoId || !newDanhHao || !oldDanhHao || !css) {
      return res.status(400).json({ message: 'User ID, Danh Hào ID, new danh hào, and old danh hào are required' });
    }

    try {
      await new Promise((resolve, reject) => {
        db.query('UPDATE users SET danh_hao = ? WHERE id = ? AND danh_hao = ?', [newDanhHao, userId, oldDanhHao], (error) => {
          if (error) reject(error);
          resolve();
        });
      });

      db.query('UPDATE user_danh_hao SET danh_hao = ?, css = ? WHERE id = ?', [newDanhHao, css, danhHaoId], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        res.status(200).json({ message: 'Danh hào updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
