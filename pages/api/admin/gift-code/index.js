import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create a new gift code
    const { code, exp, tai_san, lifetime, vatphams } = req.body;

    if (!code || !lifetime || !vatphams || vatphams.length === 0) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      // Insert into gift_codes table
      const giftCodeQuery = 'INSERT INTO gift_codes (code, exp, tai_san, lifetime) VALUES (?, ?, ?, ?)';
      const giftCodeValues = [code, exp || 0, tai_san || 0, lifetime];
      db.query(giftCodeQuery, giftCodeValues, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        const giftCodeId = results.insertId;

        // Insert associated vatpham into gift_code_vatpham table
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
    // Fetch all gift codes
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
    // Edit an existing gift code
    const { id, code, exp, tai_san, lifetime, vatphams } = req.body;

    if (!id || !code || !lifetime || !vatphams || vatphams.length === 0) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      // Update gift_codes table
      const updateQuery = 'UPDATE gift_codes SET code = ?, exp = ?, tai_san = ?, lifetime = ? WHERE id = ?';
      const updateValues = [code, exp || 0, tai_san || 0, lifetime, id];
      db.query(updateQuery, updateValues, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        // Delete existing vatphams for this gift code
        const deleteVatphamQuery = 'DELETE FROM gift_code_vatpham WHERE gift_code_id = ?';
        db.query(deleteVatphamQuery, [id], (deleteError) => {
          if (deleteError) {
            return res.status(500).json({ message: 'Internal server error', error: deleteError.message });
          }

          // Insert the updated vatpham associations
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
    // Delete a gift code
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
