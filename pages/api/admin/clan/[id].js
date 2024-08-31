import db from '@/lib/db';
import multer from 'multer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(process.cwd(), 'public/clan_icon');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const clanId = req.body.id || req.query.id;
      cb(null, `${clanId}.png`);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  },
});



export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    upload.single('clan_icon')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name, owner, accountant_id, clan_money, clan_mana, clan_color } = req.body;
      const clan_icon = req.file ? `/clan_icon/${id}.png` : null;

      const updateFields = [];
      const values = [];

      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      if (owner) {
        updateFields.push('owner = ?');
        values.push(owner);
      }
      if (accountant_id) {
        updateFields.push('accountant_id = ?');
        values.push(accountant_id);
      }
      if (clan_money) {
        updateFields.push('clan_money = ?');
        values.push(clan_money);
      }
      if (clan_mana) {
        updateFields.push('clan_mana = ?');
        values.push(clan_mana);
      }
      if (clan_color) {
        updateFields.push('clan_color = ?');
        values.push(clan_color);
      }
      if (clan_icon) {
        updateFields.push('clan_icon = ?');
        values.push(clan_icon);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      values.push(id);

      try {
        db.query(
          `UPDATE clans SET ${updateFields.join(', ')} WHERE id = ?`,
          values,
          (updateError) => {
            if (updateError) {
              return res.status(500).json({ message: 'Internal server error', error: updateError.message });
            }

            if (accountant_id) {
              db.query('UPDATE users SET clan_role = 9 WHERE id = ?', [accountant_id], (accountantError) => {
                if (accountantError) {
                  console.error('Error updating accountant role:', accountantError.message);
                }
              });
            }

            res.status(200).json({ message: 'Clan updated successfully' });
          }
        );
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });
  }  else if (req.method === 'DELETE') {
    try {
      db.query('START TRANSACTION', (startError) => {
        if (startError) {
          return res.status(500).json({ message: 'Internal server error', error: startError.message });
        }

        db.query(
          'DELETE FROM clan_members WHERE clan_id = ?',
          [id],
          (deleteMembersError) => {
            if (deleteMembersError) {
              db.query('ROLLBACK', () => {});
              return res.status(500).json({ message: 'Internal server error', error: deleteMembersError.message });
            }

            db.query(
              'DELETE FROM clan_requests WHERE clan_id = ?',
              [id],
              (deleteRequestsError) => {
                if (deleteRequestsError) {
                  db.query('ROLLBACK', () => {});
                  return res.status(500).json({ message: 'Internal server error', error: deleteRequestsError.message });
                }

                db.query(
                  'DELETE FROM clans WHERE id = ?',
                  [id],
                  (deleteClanError) => {
                    if (deleteClanError) {
                      db.query('ROLLBACK', () => {});
                      return res.status(500).json({ message: 'Internal server error', error: deleteClanError.message });
                    }

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
