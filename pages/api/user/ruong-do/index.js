import db from '@/lib/db';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      // Check if the user has any ruong_do entries
      const checkQuery = 'SELECT * FROM user_ruong_do WHERE user_id = ?';
      db.query(checkQuery, [userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        // If the user doesn't have any entries in user_ruong_do, create one
        if (results.length === 0) {
          const createRuongDoQuery = 'INSERT INTO ruong_do (vat_pham_id, so_luong) VALUES (NULL, 0)';
          db.query(createRuongDoQuery, [], (createError, createResults) => {
            if (createError) {
              return res.status(500).json({ message: 'Error creating ruong_do entry', error: createError.message });
            }

            const newRuongDoId = createResults.insertId;

            const createUserRuongDoQuery = 'INSERT INTO user_ruong_do (user_id, ruong_do_id) VALUES (?, ?)';
            db.query(createUserRuongDoQuery, [userId, newRuongDoId], (createUserRuongDoError) => {
              if (createUserRuongDoError) {
                return res.status(500).json({ message: 'Error creating user_ruong_do entry', error: createUserRuongDoError.message });
              }

              // Return an empty response as the user has no items
              return res.status(200).json([]);
            });
          });
        } else {
          // If the user has ruong_do entries, fetch and return them
          const query = `
            SELECT rd.id AS ruong_do_id, vp.name AS vat_pham_name, vp.pham_cap, vp.su_dung, rd.so_luong 
            FROM ruong_do rd 
            JOIN user_ruong_do urd ON rd.id = urd.ruong_do_id 
            LEFT JOIN vat_pham vp ON rd.vat_pham_id = vp.id
            WHERE urd.user_id = ?
          `;
          db.query(query, [userId], (fetchError, fetchResults) => {
            if (fetchError) {
              return res.status(500).json({ message: 'Internal server error', error: fetchError.message });
            }

            // Return the fetched items or an empty array if no items are found
            return res.status(200).json(fetchResults);
          });
        }
      });
    } catch (error) {
      console.error('Error fetching ruong do:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
