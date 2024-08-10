import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    db.query(
      `SELECT 
        id, username, email, role, created_at, bio, dateOfBirth, gender, image, 
        tai_san, bang_hoi, danh_hao, ngoai_hieu, ban, active, exp, level, 
        task_contribution_points, clan_contribution_points, clan_role 
      FROM users WHERE id = ?`, 
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
