// pages/api/admin/clan-requests/[id].js
import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { action, user_id, clan_id } = req.body;

    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    try {
      // Update the status of the request
      db.query('UPDATE clan_requests SET status = ? WHERE id = ?', [action, id], (updateError) => {
        if (updateError) {
          return res.status(500).json({ message: 'Internal server error', error: updateError.message });
        }

        if (action === 'approved') {
          // Add the user to the clan_members table
          db.query('INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)', [clan_id, user_id], (insertError) => {
            if (insertError) {
              return res.status(500).json({ message: 'Internal server error', error: insertError.message });
            }

            return res.status(200).json({ message: 'Request approved and user added to clan' });
          });
        } else {
          return res.status(200).json({ message: 'Request rejected' });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
