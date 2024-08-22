import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { authorization } = req.headers;
    const { username } = req.query;

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

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    try {
      const query = 'SELECT id, username FROM users WHERE LOWER(username) LIKE ?';
      const values = [`%${username.toLowerCase()}%`];

      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
