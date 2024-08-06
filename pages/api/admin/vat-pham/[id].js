import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { name, phamCap, suDung } = req.body;

    try {
      db.query(
        'UPDATE vat_pham SET name = ?, phamCap = ?, suDung = ? WHERE id = ?',
        [name, phamCap, suDung, id],
        (error) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'Item updated successfully' });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      db.query('DELETE FROM vat_pham WHERE id = ?', [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
