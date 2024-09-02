import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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
    const { medId } = req.body;

    if (!medId) {
      return res.status(400).json({ message: 'Medicine ID is required' });
    }

    const userMedicineCheck = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_medicine WHERE user_id = ? AND med_id = ?',
        [userId, medId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (userMedicineCheck) {
      return res.status(400).json({ message: 'You already know this medicine.' });
    }

    const hoaThiBichCheck = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = 78',
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!hoaThiBichCheck || hoaThiBichCheck.so_luong < 3) {
      return res.status(200).json({ message: 'Đạo hữu không có đủ Hòa Thị Bích (Cần 3)!' });
    }

    const medCheck = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
        [userId, medId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!medCheck) {
      return res.status(200).json({ message: 'Đạo hữu không có đan dược này trong rương đồ!' });
    }

    const success = Math.random() < 0.8;

    if (success) {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE ruong_do SET so_luong = so_luong - 1 WHERE user_id = ? AND vat_pham_id = ?',
          [userId, medId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE ruong_do SET so_luong = so_luong - 3 WHERE user_id = ? AND vat_pham_id = 78',
          [userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO user_medicine (user_id, med_id, skill) VALUES (?, ?, 0)',
          [userId, medId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      return res.status(200).json({ message: 'Học thành công!' });
    } else {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE ruong_do SET so_luong = so_luong - 3 WHERE user_id = ? AND vat_pham_id = 78',
          [userId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      return res.status(200).json({ message: 'Học thất bại. Mất 3 Hòa Thị Bích!' });
    }
  } catch (error) {
    console.error('Error learning medicine:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
