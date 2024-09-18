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

    const ongoingMedicine = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM medicine_making WHERE user_id = ? AND is_done = FALSE',
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (ongoingMedicine) {
      return res.status(400).json({ message: 'Bạn đang trong quá trình luyện đan, vui lòng đợi cho đến khi hoàn thành trước khi bắt đầu một quá trình mới.' });
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

    if (!userMedicineCheck) {
      return res.status(400).json({ message: 'You have not learned this medicine yet.' });
    }

    const medicineDetails = await new Promise((resolve, reject) => {
      db.query(
        'SELECT required_items, create_time FROM medicines WHERE id = ?',
        [medId],
        (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!medicineDetails || !medicineDetails.required_items || !medicineDetails.create_time) {
      return res.status(400).json({ message: 'No required items or creation time found for this medicine.' });
    }

    const requiredItems = medicineDetails.required_items.split(',').map(item => {
      const [itemId, quantity] = item.split(':').map(Number);
      return { itemId, quantity };
    });

    for (const item of requiredItems) {
      const userItem = await new Promise((resolve, reject) => {
        db.query(
          'SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
          [userId, item.itemId],
          (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
          }
        );
      });

      if (!userItem || userItem.so_luong < item.quantity) {
        const itemName = await new Promise((resolve, reject) => {
          db.query(
            'SELECT name FROM vat_pham WHERE id = ?',
            [item.itemId],
            (err, results) => {
              if (err) reject(err);
              resolve(results[0]?.name || 'Vật phẩm không xác định');
            }
          );
        });

        return res.status(400).json({ message: `Bạn không có đủ ${itemName} (Cần ${item.quantity})!` });
      }
    }

    for (const item of requiredItems) {
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE ruong_do SET so_luong = so_luong - ? WHERE user_id = ? AND vat_pham_id = ?',
          [item.quantity, userId, item.itemId],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      const updatedItem = await new Promise((resolve, reject) => {
        db.query(
          'SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
          [userId, item.itemId],
          (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
          }
        );
      });

      if (updatedItem.so_luong === 0) {
        await new Promise((resolve, reject) => {
          db.query(
            'DELETE FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?',
            [userId, item.itemId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }
    }

    const createAt = new Date();
    const createTimeInHours = medicineDetails.create_time;
    let endAt =0;
    if(userId ==5) {
endAt = new Date(createAt.getTime() + 10000);
    } else {
    endAt = new Date(createAt.getTime() + createTimeInHours * 60 * 60 * 1000);
    }
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO medicine_making (user_id, med_id, end_at, created_at) VALUES (?, ?, ?, ?)',
        [userId, medId, endAt, createAt],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    return res.status(200).json({ message: 'Medicine making process started successfully.' });
  } catch (error) {
    console.error('Error starting medicine making:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
