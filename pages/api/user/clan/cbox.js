// pages/api/clan/cbox.js
import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    // First, get the clan ID from the clan_members table
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

    // Then, get the clan information using the clan ID
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
