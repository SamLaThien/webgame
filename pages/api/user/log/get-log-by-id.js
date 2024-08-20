import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  console.log("Received userId:", userId);

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

    console.log("Executing SQL Query:", query, "with userId:", userId);

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error("SQL error:", error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      console.log("Query results:", results);

      if (results.length === 0) {
        return res.status(404).json({ message: 'No logs found for this user.' });
      }

      return res.status(200).json({ logs: results });
    });
  } catch (error) {
    console.error("Caught error:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
