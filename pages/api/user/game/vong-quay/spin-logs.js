import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, prize_category, prize_name, quantity } = req.body;

    if (!userId || !prize_category || !prize_name || !quantity) {
      return res.status(400).json({ message: 'User ID, prize category, prize name, and quantity are required' });
    }

    try {
      const query = `
        INSERT INTO spin_logs (user_id, prize_category, prize_name, quantity, timestamp)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const values = [userId, prize_category, prize_name, quantity];
      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Log added successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'GET') {
    // Handle GET request to fetch logs
    try {
      const query = 'SELECT username, prize_category, prize_name, quantity, timestamp FROM spin_logs ORDER BY timestamp DESC';
      db.query(query, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
