import db from '@/lib/db';
import axios from 'axios';

const CBOX_API_URL = 'https://www.cbox.ws/apis/threads.php?id=3-3539544-KPxXBl&key=e6ac3abc945bd9c844774459b6d2385a&act=mkthread';

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

    if (!name || !owner) {
      return res.status(400).json({ message: 'Name and owner are required' });
    }

    try {
      const newId = id || null;

      // Start transaction
      db.query('START TRANSACTION', async (startError) => {
        if (startError) {
          return res.status(500).json({ message: 'Internal server error', error: startError.message });
        }

        try {
          const response = await axios.get(CBOX_API_URL);
          const data = response.data.split("\t");

          if (data[0] === 'FAIL') {
            db.query('ROLLBACK', () => {});
            return res.status(500).json({ message: 'Error creating Cbox channel', error: data[1] });
          }

          const threadId = data[1];
          const threadKey = data[2];

          db.query(
            'INSERT INTO clans (id, name, owner, clan_money, cbox_thread_id, cbox_thread_key) VALUES (?, ?, ?, ?, ?, ?)',
            [newId, name, owner, clan_money, threadId, threadKey],
            (clanError, clanResults) => {
              if (clanError) {
                db.query('ROLLBACK', () => {});
                if (clanError.code === 'ER_DUP_ENTRY') {
                  return res.status(409).json({ message: 'Duplicate entry for id' });
                }
                return res.status(500).json({ message: 'Internal server error', error: clanError.message });
              }

              const clanId = clanResults.insertId;

              db.query(
                'INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)',
                [clanId, owner],
                (memberError) => {
                  if (memberError) {
                    db.query('ROLLBACK', () => {});
                    return res.status(500).json({ message: 'Internal server error', error: memberError.message });
                  }

                  db.query(
                    'UPDATE users SET clan_role = 7, bang_hoi = ? WHERE id = ?',
                    [clanId, owner],
                    (userError) => {
                      if (userError) {
                        db.query('ROLLBACK', () => {});
                        return res.status(500).json({ message: 'Internal server error', error: userError.message });
                      }

                      db.query('COMMIT', (commitError) => {
                        if (commitError) {
                          return res.status(500).json({ message: 'Internal server error', error: commitError.message });
                        }

                        res.status(201).json({ id: clanId, name, owner, clan_money, threadId, threadKey });
                      });
                    }
                  );
                }
              );
            }
          );
        } catch (apiError) {
          db.query('ROLLBACK', () => {});
          return res.status(500).json({ message: 'Error calling Cbox API', error: apiError.message });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
