import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      const [results] = await db.query('SELECT id, username, email, level, exp FROM users WHERE id = ?', [userId]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const user = results[0];
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
