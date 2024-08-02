import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { clan_id, member_id } = req.body;

    if (!clan_id || !member_id) {
      return res.status(400).json({ message: 'Clan ID and Member ID are required' });
    }

    try {
      // Check if the member already exists in the clan
      db.query(
        'SELECT * FROM clan_members WHERE clan_id = ? AND member_id = ?',
        [clan_id, member_id],
        (checkError, checkResults) => {
          if (checkError) {
            return res.status(500).json({ message: 'Internal server error', error: checkError.message });
          }

          if (checkResults.length > 0) {
            return res.status(400).json({ message: 'Member already exists in the clan' });
          }

          // Add the member to the clan
          db.query(
            'INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)',
            [clan_id, member_id],
            (insertError, insertResults) => {
              if (insertError) {
                return res.status(500).json({ message: 'Internal server error', error: insertError.message });
              }
              res.status(200).json({ message: 'Member added to clan successfully' });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
  