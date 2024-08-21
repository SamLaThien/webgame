import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const clanResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT clan_id FROM clan_members WHERE member_id = ?',
        [userId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (!clanResult || clanResult.length === 0) {
      return res.status(404).json({ message: 'User is not a member of any clan' });
    }

    const clanId = clanResult[0].clan_id;

    const logs = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM clan_activity_logs WHERE clan_id = ? ORDER BY timestamp DESC',
        [clanId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching clan logs:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
