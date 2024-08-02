// pages/api/check-clan-status.js

import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = 'SELECT COUNT(*) AS count FROM clan_members WHERE member_id = ?';
    db.query(query, [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      const isInClan = results[0].count > 0;
      res.status(200).json({ isInClan });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
