import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, newLevel, newTaiSan, expUsed, currentExp } = req.body;

  if (!userId || !newLevel || expUsed === undefined || currentExp === undefined) {
    return res.status(400).json({ message: 'User ID, new level, expUsed, and currentExp are required' });
  }

  try {
    const leftoverExp = currentExp - expUsed;

    db.query(
      'UPDATE users SET level = ?, exp = ?, tai_san = ? WHERE id = ?',
      [newLevel, leftoverExp, newTaiSan, userId],
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User level updated successfully', leftoverExp });
      }
    );
  } catch (error) {
    console.error('Error updating user level:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
