import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
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
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
