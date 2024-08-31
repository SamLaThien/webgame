import db from '@/lib/db';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      if (!clanId) {
        return cb(new Error('Clan ID is required'), undefined);
      }
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

const CBOX_API_URL = 'https://www.cbox.ws/apis/threads.php?id=3-3539544-KPxXBl&key=e6ac3abc945bd9c844774459b6d2385a&act=mkthread';

export default async function handler(req, res) {
  const { method } = req;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT role FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (!user || parseInt(user.role) !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (method === 'GET') {
    try {
      db.query('SELECT * FROM clans', (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (method === 'POST') {
    upload.single('clan_icon')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { id, name, owner, accountant_id, 
        // clan_color,
         password } = req.body;

      if (!name || !owner || !accountant_id || 
        // !clan_color ||
         !password) {
        return res.status(400).json({ message: 'Name, owner, accountant, and clan color are required' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newId = id || null;
        const clanMana = 10000000; 
        const iconPath = req.file ? `/clan_icon/${newId}.png` : null;

        db.query('START TRANSACTION', async (startError) => {
          if (startError) {
            return res.status(500).json({ message: 'Internal server error', error: startError.message });
          }

          try {
            const response = await axios.get(CBOX_API_URL);
            const data = response.data.split("\t");

            if (data[0] === 'FAIL') {
              db.query('ROLLBACK', () => {});
              return res.status(500).json({ message: 'Error creating Cbox channel', error: data[1] });
            }
            const threadId = data[1];
            const threadKey = data[2];

            db.query(
              'INSERT INTO clans (id, name, owner, accountant_id, clan_mana, clan_icon, password, cbox_thread_id, cbox_thread_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [newId, name, owner, accountant_id, clanMana,  iconPath, hashedPassword, threadId, threadKey],
              (clanError, clanResults) => {
                if (clanError) {
                  db.query('ROLLBACK', () => {});
                  if (clanError.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Duplicate entry for id' });
                  }
                  return res.status(500).json({ message: 'Internal server error', error: clanError.message });
                }

                const clanId = clanResults.insertId;

                db.query(
                  'INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?), (?, ?)',
                  [clanId, owner, clanId, accountant_id],
                  (memberError) => {
                    if (memberError) {
                      db.query('ROLLBACK', () => {});
                      return res.status(500).json({ message: 'Internal server error', error: memberError.message });
                    }

                    db.query(
                      'UPDATE users SET clan_role = 7, bang_hoi = ? WHERE id = ?',
                      [clanId, owner],
                      (userError) => {
                        if (userError) {
                          db.query('ROLLBACK', () => {});
                          return res.status(500).json({ message: 'Internal server error', error: userError.message });
                        }

                        db.query('COMMIT', (commitError) => {
                          if (commitError) {
                            return res.status(500).json({ message: 'Internal server error', error: commitError.message });
                          }

                          res.status(201).json({ 
                            id: clanId, 
                            name, 
                            owner,
                            accountant_id, 
                            clan_mana: clanMana, 
                            // clan_color, 
                            clan_icon: iconPath, 
                            threadId, 
                            threadKey 
                          });
                        });
                      }
                    );
                  }
                );
              }
            );
          } catch (apiError) {
            db.query('ROLLBACK', () => {});
            return res.status(500).json({ message: 'Error calling Cbox API', error: apiError.message });
          }
        });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });
  } else if (method === 'PUT') {
    const { id } = req.query;
    const { name, owner, clan_money, accountant_id, clan_color, password } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Clan ID is required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        'UPDATE clans SET name = ?, owner = ?, accountant_id = ?, clan_color = ?, password = ? WHERE id = ?',
        [name, owner, accountant_id, clan_color, hashedPassword, id],
        (error) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'Clan updated successfully' });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Clan ID is required' });
    }

    try {
      db.query('DELETE FROM clans WHERE id = ?', [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Clan deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
