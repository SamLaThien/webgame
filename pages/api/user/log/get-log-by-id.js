import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Cập nhật truy vấn để giới hạn kết quả về 100 bản ghi
    const query = `
      SELECT user_id, action_type, action_details, timestamp 
      FROM user_activity_logs 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 100
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error("SQL error:", error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No logs found for this user.' });
      }

      return res.status(200).json({ logs: results });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
