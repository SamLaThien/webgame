import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { actionType, actionDetails } = req.body;

    if (!actionType || !actionDetails) {
      return res.status(400).json({ message: 'Action type and action details are required' });
    }

    const userId = decoded.userId;

    const getClanIdQuery = 'SELECT clan_id FROM clan_members WHERE member_id = ?';
    db.query(getClanIdQuery, [userId], (clanError, results) => {
      if (clanError) {
        return res.status(500).json({ message: 'Internal server error', error: clanError.message });
      }

      if (results.length > 0) {
        const clanId = results[0].clan_id;

        const getUserDetailsQuery = `
          SELECT ngoai_hieu, username FROM users WHERE id = ?
        `;
        db.query(getUserDetailsQuery, [userId], (userError, userResults) => {
          if (userError) {
            return res.status(500).json({ message: 'Internal server error', error: userError.message });
          }

          const { ngoai_hieu, username } = userResults[0];
          const displayName = ngoai_hieu || username;
          const userLink = `<a href="https://tuchangioi.xyz/member/${userId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;

          const combinedActionDetails = `${userLink} ${actionDetails}`;

          const insertClanActivityQuery = `
            INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp)
            VALUES (?, ?, ?, ?, NOW())
          `;
          
          db.query(insertClanActivityQuery, [userId, clanId, actionType, combinedActionDetails], (logError) => {
            if (logError) {
              console.error('Error logging clan activity:', logError);
            }
          });
        });
      }

      return res.status(200).json({ message: 'Activity logged successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
