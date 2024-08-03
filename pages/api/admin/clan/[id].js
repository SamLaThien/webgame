// pages/api/admin/clan/[id].js
import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { id: newId, name, owner, clan_money } = req.body;

    if (!newId || !name || !owner) {
      return res.status(400).json({ message: 'ID, Name, and Owner are required' });
    }

    try {
      db.query(
        'UPDATE clans SET id = ?, name = ?, owner = ?, clan_money = ? WHERE id = ?',
        [newId, name, owner, clan_money, id],
        (updateError, results) => {
          if (updateError) {
            return res.status(500).json({ message: 'Internal server error', error: updateError.message });
          }

          res.status(200).json({ message: 'Clan updated successfully' });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Start transaction
      db.query('START TRANSACTION', (startError) => {
        if (startError) {
          return res.status(500).json({ message: 'Internal server error', error: startError.message });
        }

        // Delete from clan_members
        db.query(
          'DELETE FROM clan_members WHERE clan_id = ?',
          [id],
          (deleteMembersError) => {
            if (deleteMembersError) {
              db.query('ROLLBACK', () => {});
              return res.status(500).json({ message: 'Internal server error', error: deleteMembersError.message });
            }

            // Delete from clan_requests
            db.query(
              'DELETE FROM clan_requests WHERE clan_id = ?',
              [id],
              (deleteRequestsError) => {
                if (deleteRequestsError) {
                  db.query('ROLLBACK', () => {});
                  return res.status(500).json({ message: 'Internal server error', error: deleteRequestsError.message });
                }

                // Delete from clans
                db.query(
                  'DELETE FROM clans WHERE id = ?',
                  [id],
                  (deleteClanError) => {
                    if (deleteClanError) {
                      db.query('ROLLBACK', () => {});
                      return res.status(500).json({ message: 'Internal server error', error: deleteClanError.message });
                    }

                    // Commit transaction
                    db.query('COMMIT', (commitError) => {
                      if (commitError) {
                        return res.status(500).json({ message: 'Internal server error', error: commitError.message });
                      }

                      res.status(200).json({ message: 'Clan deleted successfully' });
                    });
                  }
                );
              }
            );
          }
        );
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
