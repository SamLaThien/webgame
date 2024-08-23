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

  if (req.method === 'GET') {
    try {
      db.query(
        `SELECT cr.id, cr.user_id, cr.clan_id, cr.status, u.username, c.name as clan_name
        FROM clan_requests cr
        JOIN users u ON cr.user_id = u.id
        JOIN clans c ON cr.clan_id = c.id`,
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json(results);
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { requestId } = req.query;
    const { action, user_id, clan_id } = req.body;

    if (!requestId || !action || !user_id || !clan_id) {
      return res.status(400).json({ message: 'Request ID, action, user ID, and clan ID are required' });
    }

    try {
      const updateQuery = `
        UPDATE clan_requests
        SET status = ?
        WHERE id = ?
      `;

      db.query(updateQuery, [action, requestId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        res.status(200).json({ message: `Request ${action}` });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
