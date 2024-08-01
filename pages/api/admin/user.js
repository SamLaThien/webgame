import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      db.query('SELECT id, username, email, role, ban FROM users', (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { userId } = req.query;
    const { ban } = req.body;

    if (userId === undefined || userId === null) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (ban === undefined) {
      return res.status(400).json({ message: 'Ban field is required' });
    }

    try {
      db.query(`UPDATE users SET ban = ? WHERE id = ?`, [ban, userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'User ban status updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
