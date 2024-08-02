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
    const { id, name, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ message: 'Name and owner are required' });
    }

    try {
      const newId = id || null;

      db.query(
        'INSERT INTO clans (id, name, owner) VALUES (?, ?, ?)',
        [newId, name, owner],
        (error, results) => {
          if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ message: 'Duplicate entry for id' });
            }
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(201).json({ id: results.insertId, name, owner });
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
