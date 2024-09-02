import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {

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
      return res.status(400).json({ message: 'Clan ID is required' });
    }

    try {
      const userId = decoded.userId;

      db.query(
        'SELECT id FROM clan_requests WHERE user_id = ? AND clan_id = ? AND status = "pending"',
        [userId, clan_id],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          if (results.length > 0) {
            return res.status(200).json({ message: 'Bạn đã xin vào bang này rồi, hãy đợi bang chủ duyệt' });
          } else {
            db.query(
              'INSERT INTO clan_requests (user_id, clan_id) VALUES (?, ?)',
              [userId, clan_id],
              (error) => {
                if (error) {
                  return res.status(500).json({ message: 'Internal server error', error: error.message });
                }
                res.status(201).json({ message: 'Request sent successfully' });
              }
            );
          }
        }
      );
    } catch (error) {
      console.error('Internal server error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
