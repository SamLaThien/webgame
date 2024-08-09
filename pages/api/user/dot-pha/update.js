import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, expToAdd } = req.body;

    if (!userId || expToAdd === undefined) {
      return res.status(400).json({ message: 'User ID and expToAdd are required' });
    }

    try {
      const updateQuery = 'UPDATE users SET exp = exp + ? WHERE id = ?';
      db.query(updateQuery, [expToAdd, userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Error updating user EXP', error: error.message });
        }

        return res.status(200).json({ message: 'EXP updated successfully' });
      });
    } catch (error) {
      console.error('Error updating user EXP:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
