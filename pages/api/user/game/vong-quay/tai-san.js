import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      // Retrieve the current value of tai_san
      const queryGet = 'SELECT tai_san FROM users WHERE id = ?';
      db.query(queryGet, [userId], (error, results) => {
        if (error || results.length === 0) {
          return res.status(500).json({ message: 'Internal server error', error: error?.message || 'User not found' });
        }

        let currentTaiSan = results[0].tai_san;

        if (currentTaiSan < 1000) {
          return res.status(400).json({ message: 'Insufficient tai_san. You need at least 1000k to spin.' });
        }

        const newTaiSan = Math.max(0, currentTaiSan - 300); 

        const queryUpdate = 'UPDATE users SET tai_san = ? WHERE id = ?';
        db.query(queryUpdate, [newTaiSan, userId], (error) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'Spin allowed', tai_san: newTaiSan });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
