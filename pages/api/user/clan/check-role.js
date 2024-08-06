import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    db.query('SELECT clan_role FROM users WHERE id = ?', [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found in clan' });
      }

      const userRole = results[0].clan_role;  // Changed from role_id to clan_role
      res.status(200).json({ role_id: userRole });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
