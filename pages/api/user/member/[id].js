import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { authorization } = req.headers;
  const { id } = req.query;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);
    
    // Query to get user data and also check if the user is in a clan
    db.query(
      `SELECT 
        u.id, u.username, u.email, u.role, u.created_at, u.bio, u.dateOfBirth, u.gender, u.image, 
        u.tai_san, u.bang_hoi, u.danh_hao, u.ngoai_hieu, u.ban, u.active, u.exp, u.level, 
        u.task_contribution_points, u.clan_contribution_points, u.clan_role,
        cm.clan_id,
        c.name AS clan_name
      FROM users u
      LEFT JOIN clan_members cm ON u.id = cm.member_id
      LEFT JOIN clans c ON cm.clan_id = c.id
      WHERE u.id = ?`, 
      [id], 
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(results[0]);
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
