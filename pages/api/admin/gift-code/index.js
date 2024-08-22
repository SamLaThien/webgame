import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
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

    if (!user || user.role !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  if (req.method === 'POST') {
    const { code, exp, tai_san, lifetime, vatphams, time_can_use } = req.body;

    if (!code || !lifetime || !vatphams || vatphams.length === 0) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      const giftCodeQuery = 'INSERT INTO gift_codes (code, exp, tai_san, lifetime, time_can_use) VALUES (?, ?, ?, ?, ?)';
      const giftCodeValues = [code, exp || 0, tai_san || 0, lifetime, time_can_use || 1];
      db.query(giftCodeQuery, giftCodeValues, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        const giftCodeId = results.insertId;

        const vatphamQueries = vatphams.map(({ vat_pham_id, quantity }) => {
          return new Promise((resolve, reject) => {
            const vatphamQuery = 'INSERT INTO gift_code_vatpham (gift_code_id, vat_pham_id, quantity) VALUES (?, ?, ?)';
            const vatphamValues = [giftCodeId, vat_pham_id, quantity];
            db.query(vatphamQuery, vatphamValues, (error) => {
              if (error) {
                return reject(error);
              }
              resolve();
            });
          });
        });

        Promise.all(vatphamQueries)
          .then(() => {
            res.status(201).json({ message: 'Gift code created successfully', id: giftCodeId });
          })
          .catch((error) => {
            res.status(500).json({ message: 'Internal server error', error: error.message });
          });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const query = `
        SELECT gc.*, GROUP_CONCAT(vp.Name SEPARATOR ', ') as vat_pham_names
        FROM gift_codes gc
        LEFT JOIN gift_code_vatpham gcvp ON gc.id = gcvp.gift_code_id
        LEFT JOIN vat_pham vp ON gcvp.vat_pham_id = vp.ID
        GROUP BY gc.id
      `;
      db.query(query, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id, code, exp, tai_san, lifetime, vatphams, time_can_use } = req.body;

    if (!id || !code || !lifetime || !vatphams || vatphams.length === 0) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      const updateQuery = 'UPDATE gift_codes SET code = ?, exp = ?, tai_san = ?, lifetime = ?, time_can_use = ? WHERE id = ?';
      const updateValues = [code, exp || 0, tai_san || 0, lifetime, time_can_use || 1, id];
      db.query(updateQuery, updateValues, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        const deleteVatphamQuery = 'DELETE FROM gift_code_vatpham WHERE gift_code_id = ?';
        db.query(deleteVatphamQuery, [id], (deleteError) => {
          if (deleteError) {
            return res.status(500).json({ message: 'Internal server error', error: deleteError.message });
          }

          const vatphamQueries = vatphams.map(({ vat_pham_id, quantity }) => {
            return new Promise((resolve, reject) => {
              const vatphamQuery = 'INSERT INTO gift_code_vatpham (gift_code_id, vat_pham_id, quantity) VALUES (?, ?, ?)';
              const vatphamValues = [id, vat_pham_id, quantity];
              db.query(vatphamQuery, vatphamValues, (error) => {
                if (error) {
                  return reject(error);
                }
                resolve();
              });
            });
          });

          Promise.all(vatphamQueries)
            .then(() => {
              res.status(200).json({ message: 'Gift code updated successfully' });
            })
            .catch((error) => {
              res.status(500).json({ message: 'Internal server error', error: error.message });
            });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Gift code ID is required' });
    }

    try {
      const deleteQuery = 'DELETE FROM gift_codes WHERE id = ?';
      db.query(deleteQuery, [id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Gift code deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
