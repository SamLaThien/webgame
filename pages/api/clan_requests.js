// pages/api/clan_requests.js
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, clan_id } = req.body;

    if (!user_id || !clan_id) {
      return res.status(400).json({ message: 'User ID and Clan ID are required' });
    }

    try {
      db.query('INSERT INTO clan_requests (user_id, clan_id) VALUES (?, ?)', [user_id, clan_id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(201).json({ message: 'Clan join request sent successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
