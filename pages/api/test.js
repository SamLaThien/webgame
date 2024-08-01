import db from '../../lib/db';

export default async function handler(req, res) {
  try {
    db.query('SELECT 1', (error, results) => {
      if (error) {
        console.error('Database connection error:', error.message);
        return res.status(500).json({ message: 'Database connection error', error: error.message });
      }
      res.status(200).json({ message: 'Database connection successful', results });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
}
