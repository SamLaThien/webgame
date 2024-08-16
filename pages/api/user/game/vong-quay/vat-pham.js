import db from '@/lib/db';

export default async function handler(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const query = 'SELECT ID FROM vat_pham WHERE Name = ?';
    db.query(query, [name], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Vat Pham not found' });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
