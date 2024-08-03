import db from '@/lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      // Get the clan ID for the user
      const clanMemberResult = await db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId]);
      if (clanMemberResult.length === 0) {
        return res.status(404).json({ message: 'User is not a member of any clan' });
      }

      const clanId = clanMemberResult[0].clan_id;

      // Fetch the requests for the user's clan
      db.query(
        `SELECT cr.id, cr.user_id, cr.clan_id, cr.status, u.username, c.name as clan_name
        FROM clan_requests cr
        JOIN users u ON cr.user_id = u.id
        JOIN clans c ON cr.clan_id = c.id
        WHERE cr.clan_id = ?`,
        [clanId],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json(results);
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { requestId, approve } = req.body;
    const action = approve ? 'approved' : 'rejected';

    try {
      // Update the status of the request
      db.query('UPDATE clan_requests SET status = ? WHERE id = ?', [action, requestId], (updateError) => {
        if (updateError) {
          return res.status(500).json({ message: 'Internal server error', error: updateError.message });
        }

        if (approve) {
          // Add the user to the clan_members table
          db.query('SELECT clan_id, user_id FROM clan_requests WHERE id = ?', [requestId], (selectError, selectResults) => {
            if (selectError) {
              return res.status(500).json({ message: 'Internal server error', error: selectError.message });
            }

            const { clan_id, user_id } = selectResults[0];

            db.query('INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)', [clan_id, user_id], (insertError) => {
              if (insertError) {
                return res.status(500).json({ message: 'Internal server error', error: insertError.message });
              }

              return res.status(200).json({ message: 'Request approved and user added to clan' });
            });
          });
        } else {
          return res.status(200).json({ message: 'Request rejected' });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
