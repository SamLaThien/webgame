// pages/api/user/dot-pha/info.js
import db from '@/lib/db'; // Adjust the path based on your setup

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      // Fetch all user data from the database
      const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return all user data
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
