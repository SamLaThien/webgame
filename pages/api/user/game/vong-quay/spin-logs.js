import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const getUserInfoQuery = 'SELECT ngoai_hieu, username, tai_san FROM users WHERE id = ?';
    db.query(getUserInfoQuery, [userId], async (error, results) => {
      if (error || results.length === 0) {
        return res.status(500).json({ message: 'Internal server error or user not found', error: error?.message });
      }

      const displayName = results[0].ngoai_hieu || results[0].username;

      if (req.method === 'POST') {
        const { item_id, prize_category, prize_name, quantity } = req.body;

        if (!prize_category || !prize_name) {
          return res.status(400).json({ message: 'Prize category, prize name, and quantity are required' });
        }

        try {
          const insertSpinLogQuery = `
            INSERT INTO spin_logs (username, prize_category, prize_name, quantity, timestamp, user_id)
            VALUES (?, ?, ?, ?, NOW(),?)
          `;
          const spinLogValues = [displayName, prize_category, prize_name, quantity, userId];
          await new Promise((resolve, reject) => {
            db.query(insertSpinLogQuery, spinLogValues, (insertSpinLogError) => {
              if (insertSpinLogError) {
                reject(insertSpinLogError);
              } else {
                resolve();
              }
            });
          });

          const formatNumber = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          };

          const remainingSilver = results[0].tai_san - 300;
          let actionDetails = ``;
          let number_item = 0;

          if (prize_category === 'Trừ Bạc' || prize_category === 'Giảm Kinh Nghiệm') {
            actionDetails = `vừa chơi Vòng Quay May Mắn tốn 300 bạc (còn ${formatNumber(remainingSilver)} bạc) và bị trừ ${prize_name}`;
          } else if (
            prize_category === 'Đồ Đột Phá' ||
            prize_category === 'Đồ Luyện Khí' ||
            prize_category === 'Đồ Luyện Đan' ||
            prize_category === 'Đồ Thần Bí'
          ) {
            const queryCheck = `
              SELECT id, so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?
            `;
            const checkResults = await new Promise((resolve, reject) => {
              db.query(queryCheck, [userId, item_id], (checkError, checkResults) => {
                if (checkError) {
                  reject(checkError);
                } else {
                  resolve(checkResults);
                }
              });
            });

            if (checkResults.length > 0) {
              number_item += checkResults[0].so_luong;
            }

            actionDetails = `vừa chơi Vòng Quay May Mắn tốn 300 bạc (còn ${formatNumber(remainingSilver)} bạc) và nhận được ${prize_name} (còn ${number_item})`;
          } else {
            actionDetails = `vừa chơi Vòng Quay May Mắn tốn 300 bạc (còn ${formatNumber(remainingSilver)} bạc) và nhận được ${prize_name}`;
          }

          const insertActivityLogQuery = `
            INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
            VALUES (?, 'Spin', ?, NOW())
          `;
          const activityLogValues = [userId, actionDetails];
          await new Promise((resolve, reject) => {
            db.query(insertActivityLogQuery, activityLogValues, (insertActivityLogError) => {
              if (insertActivityLogError) {
                reject(insertActivityLogError);
              } else {
                resolve();
              }
            });
          });

          res.status(200).json({ message: 'Log added successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      } else if (req.method === 'GET') {
        try {
          const fetchLogsQuery = 'SELECT username, prize_category, prize_name, quantity, timestamp,user_id FROM spin_logs ORDER BY timestamp DESC';
          db.query(fetchLogsQuery, (fetchError, results) => {
            if (fetchError) {
              return res.status(500).json({ message: 'Internal server error', error: fetchError.message });
            }
            res.status(200).json(results);
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}