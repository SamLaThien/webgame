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
    const userId = decoded.userId;

    const ongoingProcess = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM medicine_making 
         WHERE user_id = ? 
         AND is_done = false 
         AND end_at > NOW()`,
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]); 
        }
      );
    });

    if (ongoingProcess) {
      return res.status(200).json({
        message: 'You have an ongoing medicine-making process.',
        ongoingProcess
      });
    } else {
      return res.status(200).json({
        message: 'No ongoing medicine-making process found.',
      });
    }

  } catch (error) {
    console.error('Error checking medicine-making process:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
