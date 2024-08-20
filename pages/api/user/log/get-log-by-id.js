import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  console.log(userId);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const query = `
      SELECT user_id, action_type, action_details, timestamp 
      FROM user_activity_logs 
      WHERE user_id = ? 
      ORDER BY timestamp DESC
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      return res.status(200).json({ logs: results });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
