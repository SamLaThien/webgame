import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, actionType, actionDetails } = req.body;

  if (!userId || !actionType || !actionDetails) {
    return res.status(400).json({ message: 'User ID, action type, and action details are required' });
  }

  try {
    const query = `
      INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
      VALUES (?, ?, ?, NOW())
    `;
    
    db.query(query, [userId, actionType, actionDetails], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      return res.status(200).json({ message: 'Activity logged successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
