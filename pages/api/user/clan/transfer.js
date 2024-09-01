import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  const { vatPhamId, soLuong, memberId } = req.body;

  if (!vatPhamId || !soLuong || !memberId) {
    return res.status(400).json({ message: 'vatPhamId, soLuong, and memberId are required' });
  }

  try {
    await db.query('START TRANSACTION');

    const [sourceClan] = await new Promise((resolve, reject) => {
      db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    const [targetClan] = await new Promise((resolve, reject) => {
      db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [memberId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (!sourceClan || !targetClan || sourceClan.clan_id !== targetClan.clan_id) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Users must be in the same clan to transfer items' });
    }

    const clanId = sourceClan.clan_id;

    const [item] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM clan_ruong_do WHERE clan_id = ? AND vat_pham_id = ?', [clanId, vatPhamId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (!item || item.so_luong < soLuong) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient quantity in clan storage or item not found' });
    }

    await new Promise((resolve, reject) => {
      db.query('UPDATE clan_ruong_do SET so_luong = so_luong - ? WHERE clan_id = ? AND vat_pham_id = ?', [soLuong, clanId, vatPhamId], (error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    const [existingItem] = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
        [memberId, vatPhamId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (existingItem) {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE ruong_do SET so_luong = so_luong + ? WHERE user_id = ? AND vat_pham_id = ?',
          [soLuong, memberId, vatPhamId],
          (error) => {
            if (error) return reject(error);
            resolve();
          }
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO ruong_do (user_id, vat_pham_id, so_luong) VALUES (?, ?, ?)',
          [memberId, vatPhamId, soLuong],
          (error) => {
            if (error) return reject(error);
            resolve();
          }
        );
      });
    }

    await db.query('COMMIT');
    return res.status(200).json({ message: 'Item transferred successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error transferring item:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
