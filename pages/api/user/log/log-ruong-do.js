import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { addLogs } from '/var/www/bot/logs.js'

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
    const { actionType, actionDetails } = req.body;

    if (!actionType || !actionDetails) {
      return res.status(400).json({ message: 'Action type and action details are required' });
    }

    const userId = decoded.userId;

    const userActivityQuery = `
      INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
      VALUES (?, ?, ?, NOW())
    `;
    const getUserDetailsQuery = `
      SELECT ngoai_hieu, username FROM users WHERE id = ?
    `;

    // Sử dụng Promise để chờ kết quả từ truy vấn lấy thông tin người dùng
    const userResults = await new Promise((resolve, reject) => {
      db.query(getUserDetailsQuery, [userId], (userError, results) => {
        if (userError) {
          return reject(userError);
        }
        if (results.length === 0) {
          return reject(new Error('User not found'));
        }
        resolve(results[0]);
      });
    });

    const { ngoai_hieu, username } = userResults;
    const displayName = ngoai_hieu || username;

    let message = `Đạo hữu ${displayName} (ID ${userId}) ${actionDetails}`;
    await addLogs(message);

    await new Promise((resolve, reject) => {
      db.query(userActivityQuery, [userId, actionType, actionDetails], (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });

    return res.status(200).json({ message: 'User activity logged successfully' });
  } catch (error) {
    console.error("Error:", error); // Ghi lỗi vào console để dễ dàng gỡ lỗi
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
