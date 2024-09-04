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
        const { slot_number, spinToken } = req.body;

        if (!userId || !slot_number || !spinToken) {
          return res.status(400).json({ message: 'User ID, slot number, and spinToken are required' });
        }

        try {
          const spinDecoded = jwt.verify(spinToken, process.env.JWT_SECRET);
          if (!spinDecoded || spinDecoded.userId !== userId) {
            return res.status(403).json({ message: 'Invalid spin token' });
          }

          const queryGetTaiSan = 'SELECT tai_san FROM users WHERE id = ?';
          db.query(queryGetTaiSan, [userId], (taiSanError, taiSanResults) => {
            if (taiSanError || taiSanResults.length === 0) {
              return res.status(500).json({ message: 'Internal server error', error: taiSanError?.message || 'User not found' });
            }

            let currentTaiSan = taiSanResults[0].tai_san;

            if (currentTaiSan < 1000) {
              return res.status(400).json({ message: 'Insufficient tai_san. You need at least 1000k to spin.' });
            }

            const newTaiSan = Math.max(0, currentTaiSan - 300);



            const queryGetItems = `
              SELECT option_text, prize_rate, item_id FROM wheel_slots WHERE slot_number = ?
            `;
            db.query(queryGetItems, [slot_number], (error, results) => {
              if (error) {
                return res.status(500).json({ message: 'Internal server error', error: error.message });
              }

              if (results.length === 0) {
                return res.status(404).json({ message: 'No items found for this slot number' });
              }

              let totalWeight = results.reduce((sum, item) => sum + item.prize_rate, 0);
              let randomNum = Math.random() * totalWeight;

              let selectedItem;
              for (let item of results) {
                if (randomNum < item.prize_rate) {
                  selectedItem = item;
                  break;
                }
                randomNum -= item.prize_rate;
              }

              if (!selectedItem || !selectedItem.item_id || selectedItem.option_text === undefined || selectedItem.item_id === undefined) {
                return res.status(404).json({ message: 'No valid item found for this slot number' });
              }

              const queryCheck = `
                SELECT id, so_luong FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?
              `;
              db.query(queryCheck, [userId, selectedItem.item_id], (checkError, checkResults) => {
                if (checkError) {
                  return res.status(500).json({ message: 'Internal server error', error: checkError.message });
                }
                let amount = 0;

                if (/Linh Tuyền|Hư Không Chi Thạch|Băng Hỏa Ngọc/.test(selectedItem.option_text)) {
                  amount = 1;
                  console.log(amount)
                } else {
                  amount = randomNumber();
                }

                if (checkResults.length > 0) {
                  const existingItem = checkResults[0];
                  const newQuantity = existingItem.so_luong + parseInt(amount);
                  const queryUpdate = `
                    UPDATE ruong_do SET so_luong = ? WHERE id = ?
                  `;
                  db.query(queryUpdate, [newQuantity, existingItem.id], (updateError) => {
                    if (updateError) {
                      return res.status(500).json({ message: 'Internal server error', error: updateError.message });
                    }
                    res.status(200).json({ username: displayName, message: 'Item quantity updated successfully', item: selectedItem.option_text, item_id: selectedItem.item_id, amount: amount });
                  });
                } else {
                  const queryInsert = `
                    INSERT INTO ruong_do (user_id, vat_pham_id, so_luong)
                    VALUES (?, ?, 1)
                  `;
                  db.query(queryInsert, [userId, selectedItem.item_id], (insertError) => {
                    if (insertError) {
                      return res.status(500).json({ message: 'Internal server error', error: insertError.message });
                    }
                    res.status(200).json({ username: displayName, message: 'Item quantity updated successfully', item: selectedItem.option_text, item_id: selectedItem.item_id, amount: amount });
                  });
                }
              });
              const queryUpdateTaiSan = 'UPDATE users SET tai_san = ? WHERE id = ?';
              db.query(queryUpdateTaiSan, [newTaiSan, userId], (updateTaiSanError) => {
                if (updateTaiSanError) {
                  return res.status(500).json({ message: 'Internal server error', error: updateTaiSanError.message });
                }
              });
            });
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function randomNumber() {
  const rate = {
    '1': 300,
    '2': 5,
    '3': 1,
    '5': 1,
  };
  return parseRateArray(rate);
}

function parseRateArray(rate) {
  try {
    let totalWeight = Object.values(rate).reduce((sum, weight) => sum + weight, 0);
    let randomNum = Math.random() * totalWeight;

    for (let item in rate) {
      if (randomNum < rate[item]) {
        return item;
      }
      randomNum -= rate[item];
    }
    return Object.keys(rate)[0];
  } catch (error) {
    console.error('Error parsing rate array:', error);
    throw error;
  }
}