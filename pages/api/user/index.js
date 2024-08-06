import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.body;
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    db.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = results[0];
      res.status(200).json(user);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
