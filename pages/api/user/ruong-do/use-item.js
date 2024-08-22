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
    const userId = decoded.userId;
    const { vatPhamId, useAmount } = req.body;

    if (!vatPhamId || !useAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
      SELECT rd.so_luong, vp.SuDung 
      FROM ruong_do rd 
      JOIN vat_pham vp ON rd.vat_pham_id = vp.ID 
      WHERE rd.vat_pham_id = ? AND rd.user_id = ?
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [vatPhamId, userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = results[0];
    const expGain = item.SuDung * useAmount;

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET exp = exp + ? WHERE id = ?', [expGain, userId], (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query('UPDATE ruong_do SET so_luong = so_luong - ? WHERE vat_pham_id = ? AND user_id = ?', [useAmount, vatPhamId, userId], (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });

    return res.status(200).json({ success: true, message: 'Item used successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
