import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { ban } = req.body;

    if (ban === undefined) {
      return res.status(400).json({ message: 'Ban field is required' });
    }

    try {
      db.query('UPDATE users SET ban = ? WHERE id = ?', [ban, id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'User ban status updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { id: newId, username, email, role, bio, tai_san, ban } = req.body;

    if (!newId || !username || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      db.query(
        'UPDATE users SET username = ?, email = ?, role = ?, bio = ?, tai_san = ?, ban = ? WHERE id = ?',
        [username, email, role, bio, tai_san, ban, id],
        (error, results) => {
          if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ message: 'Duplicate entry for email or id' });
            }
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'User updated successfully' });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      db.query('SELECT id, username, email, role, bio, tai_san, ban FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(results[0]);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
