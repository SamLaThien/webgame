import db from '@/lib/db';
import moment from 'moment';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { giftCode } = req.body;

    if (!userId || !giftCode) {
      return res.status(400).json({ message: 'User ID and gift code are required' });
    }

    const userQuery = `SELECT created_at FROM users WHERE id = ?`;
    db.query(userQuery, [userId], async (error, results) => {
      if (error || results.length === 0) {
        return res.status(500).json({ message: 'Internal server error or user not found', error: error?.message });
      }

      const userCreatedAt = results[0].created_at;
      const currentTime = moment();

      if (currentTime.diff(moment(userCreatedAt), 'days') < 3) {
        return res.status(403).json({ message: 'Account must be older than 3 days to redeem a gift code' });
      }

      const checkLogQuery = `
        SELECT * FROM user_activity_logs 
        WHERE user_id = ? AND action_type LIKE CONCAT('giftcode-', ?)
      `;
      db.query(checkLogQuery, [userId, giftCode], (logError, logResults) => {
        if (logError) {
          return res.status(500).json({ message: 'Internal server error while checking activity log', error: logError.message });
        }

        if (logResults.length > 0) {
          return res.status(403).json({ message: 'Gift code has already been used by this user' });
        }

        const codeQuery = `SELECT * FROM gift_codes WHERE code = ? AND active = 1`;
        db.query(codeQuery, [giftCode], (codeError, codeResults) => {
          if (codeError || codeResults.length === 0) {
            return res.status(404).json({ message: 'Gift code not found or inactive' });
          }

          const giftCodeData = codeResults[0];
          const codeCreatedAt = moment(giftCodeData.created_at);
          const daysSinceCreation = currentTime.diff(codeCreatedAt, 'days');

          if (daysSinceCreation > giftCodeData.lifetime) {
            return res.status(403).json({ message: 'Gift code has expired' });
          }

          if (giftCodeData.time_can_use <= 0) {
            return res.status(403).json({ message: 'Gift code has already been used' });
          }

          const updateUserQuery = ` 
            UPDATE users 
            SET exp = exp + ?, tai_san = tai_san + ?
            WHERE id = ?
          `;
          const updateGiftCodeQuery = `
            UPDATE gift_codes 
            SET time_can_use = time_can_use - 1, active = IF(time_can_use = 1, 0, active)
            WHERE id = ?
          `;

          db.query(updateUserQuery, [giftCodeData.exp, giftCodeData.tai_san, userId], (userUpdateError) => {
            if (userUpdateError) {
              return res.status(500).json({ message: 'Internal server error while updating user', error: userUpdateError.message });
            }

            db.query(updateGiftCodeQuery, [giftCodeData.id], (giftUpdateError) => {
              if (giftUpdateError) {
                return res.status(500).json({ message: 'Internal server error while updating gift code', error: giftUpdateError.message });
              }

              const giftItemsQuery = `
                SELECT vat_pham_id, quantity 
                FROM gift_code_vatpham 
                WHERE gift_code_id = ?
              `;
              db.query(giftItemsQuery, [giftCodeData.id], (itemError, items) => {
                if (itemError) {
                  return res.status(500).json({ message: 'Internal server error while fetching gift items', error: itemError.message });
                }

                items.forEach((item) => {
                  const { vat_pham_id, quantity } = item;

                  const existingItemQuery = `
                    SELECT id, so_luong 
                    FROM ruong_do 
                    WHERE user_id = ? AND vat_pham_id = ?
                  `;
                  db.query(existingItemQuery, [userId, vat_pham_id], (existingItemError, existingItems) => {
                    if (existingItemError) {
                      return res.status(500).json({ message: 'Internal server error while checking ruong_do', error: existingItemError.message });
                    }

                    if (existingItems.length > 0) {
                      const newQuantity = existingItems[0].so_luong + quantity;
                      const updateItemQuery = `
                        UPDATE ruong_do 
                        SET so_luong = ? 
                        WHERE id = ?
                      `;
                      db.query(updateItemQuery, [newQuantity, existingItems[0].id], (updateError) => {
                        if (updateError) {
                          return res.status(500).json({ message: 'Internal server error while updating ruong_do', error: updateError.message });
                        }
                      });
                    } else {
                      const insertItemQuery = `
                        INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) 
                        VALUES (?, ?, ?)
                      `;
                      db.query(insertItemQuery, [vat_pham_id, quantity, userId], (insertError) => {
                        if (insertError) {
                          return res.status(500).json({ message: 'Internal server error while inserting into ruong_do', error: insertError.message });
                        }
                      });
                    }
                  });
                });

                const logQuery = `
                  INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
                  VALUES (?, ?, ?, NOW())
                `;
                const logMessage = `User ${userId} redeemed gift code ${giftCode}. Received ${giftCodeData.exp} EXP, ${giftCodeData.tai_san} tài sản, and associated items.`;
                const actionType = `giftcode-${giftCode}`;

                db.query(logQuery, [userId, actionType, logMessage], (logError) => {
                  if (logError) {
                    return res.status(500).json({ message: 'Internal server error while logging activity', error: logError.message });
                  }

                  return res.status(200).json({ message: 'Gift code redeemed successfully', exp: giftCodeData.exp, tai_san: giftCodeData.tai_san });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
