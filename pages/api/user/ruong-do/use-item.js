import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { userId, vatPhamId, useAmount } = req.body;

  console.log('Debug: Incoming data', { userId, vatPhamId, useAmount });

  if (!userId || !vatPhamId || !useAmount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const query = `
      SELECT rd.so_luong, vp.SuDung, vp.phan_loai 
      FROM ruong_do rd 
      JOIN vat_pham vp ON rd.vat_pham_id = vp.ID 
      WHERE rd.vat_pham_id = ? AND rd.user_id = ?
    `;

    console.log('Debug: Executing query', query);

    const results = await new Promise((resolve, reject) => {
      db.query(query, [vatPhamId, userId], (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return reject(error);
        }
        resolve(results);
      });
    });

    console.log('Debug: Database query result', results);

    if (!results || results.length === 0) {
      console.log('Debug: No item found or result is not an array', results);
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = results[0];
    console.log('Debug: Item found', item);

    const expGain = item.SuDung * useAmount;
    console.log('Debug: Experience gain calculated', expGain);

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET exp = exp + ? WHERE id = ?', [expGain, userId], (error, results) => {
        if (error) {
          console.error('Error updating user experience:', error);
          return reject(error);
        }
        resolve(results);
      });
    });

    console.log('Debug: Updated user experience');

    await new Promise((resolve, reject) => {
      db.query('UPDATE ruong_do SET so_luong = so_luong - ? WHERE vat_pham_id = ? AND user_id = ?', [useAmount, vatPhamId, userId], (error, results) => {
        if (error) {
          console.error('Error updating item quantity:', error);
          return reject(error);
        }
        resolve(results);
      });
    });

    console.log('Debug: Updated item quantity in ruong_do');

    return res.status(200).json({ success: true, message: 'Item used successfully' });
  } catch (error) {
    console.error('Error using item:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
