import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { giftItems } from '@/utils/giftItems';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }

  const { userId, newLevel, newTaiSan, expUsed, currentExp } = req.body;

  if (!userId || !newLevel || expUsed === undefined || currentExp === undefined) {
    return res.status(400).json({ message: 'User ID, new level, expUsed, and currentExp are required' });
  }

  try {
    const leftoverExp = currentExp - expUsed;

    const levelRange = getLevelRange(newLevel);
    const availableItems = giftItems[levelRange];

    if (!availableItems || availableItems.length === 0) {
      return res.status(400).json({ message: 'No items available for this level range' });
    }

    const randomItemId = availableItems[Math.floor(Math.random() * availableItems.length)];

    db.query(
      'UPDATE users SET level = ?, exp = ?, tai_san = ? WHERE id = ?',
      [newLevel, leftoverExp, newTaiSan, userId],
      async (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        try {
          const itemResult = await new Promise((resolve, reject) => {
            db.query(
              'SELECT Name FROM vat_pham WHERE ID = ?',
              [randomItemId],
              (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
              }
            );
          });

          await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO ruong_do (user_id, vat_pham_id, so_luong) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE so_luong = so_luong + 1',
              [userId, randomItemId],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });

          const updatedSoLuong = await new Promise((resolve, reject) => {
            db.query(
              'SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
              [userId, randomItemId],
              (err, results) => {
                if (err) reject(err);
                resolve(results[0].so_luong);
              }
            );
          });

          res.status(200).json({
            message: 'User level updated successfully',
            leftoverExp,
            item: itemResult,
            so_luong: updatedSoLuong,
          });
        } catch (err) {
          res.status(500).json({ message: 'Failed to add item to ruong_do', error: err.message });
        }
      }
    );
  } catch (error) {
    console.error('Error updating user level:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

function getLevelRange(level) {
  if (level <= 10) return '1-10';
  if (level <= 20) return '11-20';
  if (level <= 30) return '21-30';
  if (level <= 40) return '31-40';
  if (level <= 50) return '41-50';
  if (level <= 60) return '51-60';
  if (level <= 70) return '61-70';
  if (level <= 80) return '71-80';
  if (level <= 90) return '81-90';
  if (level <= 100) return '91-100';
  if (level <= 110) return '101-110';
  if (level <= 120) return '111-120';
  if (level <= 130) return '121-130';
  return 'out-of-range';
}
