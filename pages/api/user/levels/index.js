import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [results] = await db.query('SELECT id, tu_vi, exp FROM levels ORDER BY id ASC');
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching levels:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
