import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'User is not a member of any clan' });
        }

        const clanId = results[0].clan_id;

        const query = `
          SELECT crd.*, vp.Name 
          FROM clan_ruong_do crd
          JOIN vat_pham vp ON crd.vat_pham_id = vp.ID
          WHERE crd.clan_id = ?
        `;

        db.query(query, [clanId], (clanError, items) => {
          if (clanError) {
            return res.status(500).json({ message: 'Internal server error', error: clanError.message });
          }
          res.status(200).json(items);
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
