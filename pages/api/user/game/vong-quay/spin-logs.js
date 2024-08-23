import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; 

    // Fetch the ngoai_hieu and username based on the userId
    const getUserInfoQuery = 'SELECT ngoai_hieu, username FROM users WHERE id = ?';
    db.query(getUserInfoQuery, [userId], (error, results) => {
      if (error || results.length === 0) {
        return res.status(500).json({ message: 'Internal server error or user not found', error: error?.message });
      }

      // Use ngoai_hieu if available, otherwise fallback to username
      const displayName = results[0].ngoai_hieu || results[0].username;

      if (req.method === 'POST') {
        const { prize_category, prize_name, quantity } = req.body;

        if (!prize_category || !prize_name) {
          return res.status(400).json({ message: 'Prize category, prize name, and quantity are required' });
        }

        try {
          const insertLogQuery = `
            INSERT INTO spin_logs (username, prize_category, prize_name, quantity, timestamp)
            VALUES (?, ?, ?, ?, NOW())
          `;
          const values = [displayName, prize_category, prize_name, quantity];
          db.query(insertLogQuery, values, (insertError) => {
            if (insertError) {
              return res.status(500).json({ message: 'Internal server error', error: insertError.message });
            }
            res.status(200).json({ message: 'Log added successfully' });
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      } else if (req.method === 'GET') {
        try {
          const fetchLogsQuery = 'SELECT username, prize_category, prize_name, quantity, timestamp FROM spin_logs ORDER BY timestamp DESC';
          db.query(fetchLogsQuery, (fetchError, results) => {
            if (fetchError) {
              return res.status(500).json({ message: 'Internal server error', error: fetchError.message });
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
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
