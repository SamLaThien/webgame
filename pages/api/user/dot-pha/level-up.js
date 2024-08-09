import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, newLevel, newTaiSan } = req.body;

  if (!userId || !newLevel) {
    return res.status(400).json({ message: 'User ID and new level are required' });
  }

  try {
    // Update the user's level and reset EXP, also update tai_san
    db.query(
      'UPDATE users SET level = ?, exp = 0, tai_san = ? WHERE id = ?',
      [newLevel, newTaiSan, userId],
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User level updated successfully' });
      }
    );
  } catch (error) {
    console.error('Error updating user level:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
