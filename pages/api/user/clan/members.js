import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get the user's clan ID
    db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User is not in a clan' });
      }

      const clanId = results[0].clan_id;

      // Get all members in the clan
      db.query(
        'SELECT u.id, u.username, u.email, u.role, u.tai_san, u.bang_hoi, u.danh_hao, u.ngoai_hieu, u.exp, u.level, u.task_contribution_points, u.clan_contribution_points, u.clan_role FROM users u JOIN clan_members cm ON u.id = cm.member_id WHERE cm.clan_id = ?',
        [clanId],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json(results);
        }
      );
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}
