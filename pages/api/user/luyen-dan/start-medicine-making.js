import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { parseName } from '@/utils/dsItem';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization token is required' });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { medId } = req.body;

    if (!medId) return res.status(400).json({ message: 'Medicine ID is required' });

    const ongoingMedicine = await queryDb('SELECT * FROM medicine_making WHERE user_id = ? AND is_done = FALSE', [userId]);
    if (ongoingMedicine) {
      return res.status(400).json({ message: 'Đạo hữu đang luyện đan.' });
    }

    const userMedicineCheck = await queryDb('SELECT * FROM user_medicine WHERE user_id = ? AND med_id = ?', [userId, medId]);
    if (!userMedicineCheck) return res.status(400).json({ message: 'You have not learned this medicine yet.' });

    const medicineDetails = await queryDb('SELECT required_items, create_time FROM medicines WHERE id = ?', [medId]);
    if (!medicineDetails?.required_items || !medicineDetails.create_time) {
      return res.status(400).json({ message: 'No required items or creation time found for this medicine.' });
    }

    const requiredItems = medicineDetails.required_items.split(',').map(item => {
      const [itemId, quantity] = item.split(':').map(Number);
      return { itemId, quantity };
    });

    for (const item of requiredItems) {
      const userItem = await queryDb('SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?', [userId, item.itemId]);
      if (!userItem || userItem.so_luong < item.quantity) {
        const itemName = await queryDb('SELECT name FROM vat_pham WHERE id = ?', [item.itemId]);
        return res.status(400).json({ message: `Đạo hữu không có đủ ${itemName?.name || 'Vật phẩm không xác định'} (Cần ${item.quantity})!` });
      }
    }

    const messages = [];
    for (const item of requiredItems) {
      await queryDb('UPDATE ruong_do SET so_luong = so_luong - ? WHERE user_id = ? AND vat_pham_id = ?', [item.quantity, userId, item.itemId]);
      const updatedItem = await queryDb('SELECT so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?', [userId, item.itemId]);
      messages.push(`${item.quantity} ${parseName(item.itemId)} (Còn ${updatedItem.so_luong})`);
      if (updatedItem.so_luong === 0) {
        await queryDb('DELETE FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?', [userId, item.itemId]);
      }
    }

    const actionDetails = `vừa dùng ${messages.join(', ')} để luyện chế ${parseName(medId)}.`;
    await queryDb('INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Medicine Check", ?, NOW())', [userId, actionDetails]);

    const createAt = new Date();
    const createTimeInHours = medicineDetails.create_time;
    let endAt = 0;
    if (userId == 5) {
      endAt = new Date(createAt.getTime() + 10000);
    } else {
      endAt = new Date(createAt.getTime() + createTimeInHours * 60 * 60 * 1000);
    }
    await queryDb('INSERT INTO medicine_making (user_id, med_id, end_at, created_at) VALUES (?, ?, ?, ?)', [userId, medId, endAt, createAt]);

    return res.status(200).json({ message: 'Đang luyện đan' });
  } catch (error) {
    console.error('Error starting medicine making:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

function queryDb(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}
