import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      db.query('SELECT * FROM clans', (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { id, name, owner, clan_money } = req.body;

    if (!id || !name || !owner) {
      return res.status(400).json({ message: 'ID, Name, and Owner are required' });
    }

    try {
      db.query(
        'INSERT INTO clans (id, name, owner, clan_money) VALUES (?, ?, ?, ?)',
        [id, name, owner, clan_money],
        (error, results) => {
          if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ message: 'Duplicate entry for id' });
            }
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          // Add the owner to the clan_members table
          db.query(
            'INSERT INTO clan_members (member_id, clan_id) VALUES (?, ?)',
            [owner, id],
            (memberError) => {
              if (memberError) {
                return res.status(500).json({ message: 'Internal server error', error: memberError.message });
              }
              res.status(201).json({ id, name, owner, clan_money });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
