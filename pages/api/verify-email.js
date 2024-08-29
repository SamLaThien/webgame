// pages/api/verify-email.js
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Invalid or missing token' });
  }

  try {
    db.query(
      'UPDATE users SET active = 1, verification_token = NULL WHERE verification_token = ?',
      [token],
      (error, results) => {
        if (error) {
          console.error('Error updating user:', error.message);
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        if (results.affectedRows === 0) {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }

        res.status(200).json({ message: 'Account successfully verified' });
      }
    );
  } catch (error) {
    console.error('Error verifying account:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
