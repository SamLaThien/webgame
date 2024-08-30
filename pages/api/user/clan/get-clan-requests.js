// pages/api/admin/clan-requests/index.js
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      db.query(
        `SELECT cr.id, cr.user_id, cr.clan_id, cr.status, u.ngoai_hieu, u.username, c.name as clan_name
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
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
