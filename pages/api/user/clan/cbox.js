import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid token data' });
    }

    const [clanMember] = await new Promise((resolve, reject) => {
      db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (!clanMember) {
      return res.status(404).json({ message: 'User is not in any clan' });
    }

    const clanId = clanMember.clan_id;

    const [clan] = await new Promise((resolve, reject) => {
      db.query('SELECT cbox_thread_id, cbox_thread_key FROM clans WHERE id = ?', [clanId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (!clan) {
      return res.status(404).json({ message: 'Clan not found' });
    }

    res.status(200).json({ cbox_thread_id: clan.cbox_thread_id, cbox_thread_key: clan.cbox_thread_key });
  } catch (error) {
    console.error('Error fetching clan chat info:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
