import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;  
    const { clan_id } = req.body;  

    if (!userId || !clan_id) {
      return res.status(400).json({ message: 'User ID and Clan ID are required' });
    }

    db.beginTransaction((transactionError) => {
      if (transactionError) {
        return res.status(500).json({ message: 'Transaction error', error: transactionError.message });
      }

      db.query('UPDATE users SET clan_role = NULL WHERE id = ?', [userId], (updateError) => {
        if (updateError) {
          return db.rollback(() => {
            return res.status(500).json({ message: 'Error updating user clan role', error: updateError.message });
          });
        }

        db.query('DELETE FROM clan_members WHERE member_id = ?', [userId], (deleteError) => {
          if (deleteError) {
            return db.rollback(() => {
              return res.status(500).json({ message: 'Error deleting clan membership', error: deleteError.message });
            });
          }

          db.commit((commitError) => {
            if (commitError) {
              return db.rollback(() => {
                return res.status(500).json({ message: 'Commit error', error: commitError.message });
              });
            }

            return res.status(200).json({ message: 'Rời bang thành công.' });
          });
        });
      });
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
