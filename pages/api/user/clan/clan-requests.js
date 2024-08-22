import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  console.log('API request received:', req.method);

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (req.method === 'POST') {
    const { clan_id } = req.body;

    if (!clan_id) {
      console.error('Clan ID is missing');
      return res.status(400).json({ message: 'Clan ID is required' });
    }

    try {
      const userId = decoded.userId;

      db.query('SELECT username FROM users WHERE id = ?', [userId], (error, results) => {
        if (error || results.length === 0) {
          console.error('User not found or internal server error:', error ? error.message : 'User not found');
          return res.status(500).json({ message: 'User not found or internal server error', error: error ? error.message : null });
        }

        const username = results[0].username;
        console.log('Fetched username:', username);

        db.query(
          'INSERT INTO clan_requests (user_id, clan_id) VALUES (?, ?)',
          [userId, clan_id],
          (error, results) => {
            if (error) {
              console.error('Error inserting into clan_requests:', error.message);
              return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
            console.log('Clan request created successfully');
            res.status(201).json({ message: 'Clan request created successfully' });
          }
        );
      });
    } catch (error) {
      console.error('Internal server error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
