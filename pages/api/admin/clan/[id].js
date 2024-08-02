import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { id: newId, name, owner } = req.body;

    if (!newId || !name || !owner) {
      return res.status(400).json({ message: 'ID, Name, and Owner are required' });
    }

    try {
      const clanData = { id: newId, name, owner };

      db.query('DELETE FROM clans WHERE id = ?', [id], (deleteError) => {
        if (deleteError) {
          return res.status(500).json({ message: 'Internal server error', error: deleteError.message });
        }

        db.query('INSERT INTO clans SET ?', clanData, (insertError, insertResults) => {
          if (insertError) {
            if (insertError.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ message: 'Duplicate entry for id' });
            }
            return res.status(500).json({ message: 'Internal server error', error: insertError.message });
          }

          res.status(200).json({ message: 'Clan updated successfully' });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      db.query('DELETE FROM clans WHERE id = ?', [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Clan deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
