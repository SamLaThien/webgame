import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  try {
    const userClanResult = await new Promise((resolve, reject) => {
      db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (userClanResult.length === 0) {
      return res.status(404).json({ message: 'User is not a member of any clan' });
    }

    const clanId = userClanResult[0].clan_id;

    const clanInfoResult = await new Promise((resolve, reject) => {
      db.query('SELECT id, name, owner, accountant_id, password FROM clans WHERE id = ?', [clanId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (clanInfoResult.length === 0) {
      return res.status(404).json({ message: 'Clan not found' });
    }

    const clanInfo = clanInfoResult[0];
    return res.status(200).json(clanInfo);
  } catch (error) {
    console.error('Error fetching clan info:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
