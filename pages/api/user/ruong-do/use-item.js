import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { expItems } from '@/utils/expItem';

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
    const vatPhamIdNumber = Number(vatPhamId);
    const useAmountNumber = Number(useAmount)
    if (!vatPhamId || !useAmountNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userQuery = 'SELECT level FROM users WHERE id = ?';
    const userResult = await new Promise((resolve, reject) => {
      db.query(userQuery, [userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userLevel = userResult[0].level;
    let levelRange;

    if (userLevel <= 19) levelRange = 1;
    else if (userLevel <= 29) levelRange = 2;
    else if (userLevel <= 39) levelRange = 3;
    else if (userLevel <= 49) levelRange = 4;
    else if (userLevel <= 59) levelRange = 5;
    else if (userLevel <= 69) levelRange = 6;
    else if (userLevel <= 79) levelRange = 7;
    else if (userLevel <= 89) levelRange = 8;
    else if (userLevel <= 99) levelRange = 9;
    else if (userLevel <= 109) levelRange = 10;
    else if (userLevel <= 119) levelRange = 11;
    else if (userLevel <= 129) levelRange = 12;

    if (vatPhamIdNumber == 1) { levelRange = 0; }
    const allowedRanges = Object.keys(expItems)
      .filter(range => parseInt(range) <= levelRange)
      .map(range => parseInt(range));

    const itemLevel = Object.keys(expItems).find(range =>
      expItems[range].includes(vatPhamIdNumber)
    );

    if (itemLevel > levelRange) {
      return res.status(200).json({ message: 'Đạo hữu không đủ cấp bậc để sử dụng. Cố sử dụng sẽ bạo thể mà chết.' });
    }

    const itemQuery = `
      SELECT rd.so_luong, vp.SuDung 
      FROM ruong_do rd 
      JOIN vat_pham vp ON rd.vat_pham_id = vp.ID 
      WHERE rd.vat_pham_id = ? AND rd.user_id = ?
    `;
    const itemResult = await new Promise((resolve, reject) => {
      db.query(itemQuery, [vatPhamId, userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    //[ itemResult { so_luong: 279, SuDung: 30 } ]

    if (!itemResult || itemResult.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = itemResult[0];

    // check item thuoc cap may
    let itemLevelRange;
    for (const range in expItems) {
      if (expItems[range].includes(vatPhamIdNumber)) {
        itemLevelRange = range;
        break;
      }
    }

    if (!itemLevelRange) {
      return res.status(400).json({ message: 'Invalid item level range' });
    }

    // Calculate the experience gain reduction
    const userRangeStart = parseInt(levelRange);
    const itemRangeStart = parseInt(itemLevelRange);

    let reductionPercentage = Math.max(0, userRangeStart - itemRangeStart) / 10 * 100;

    if (itemLevelRange = 0) {
      reductionPercentage = 1;
    }
    console.log(reductionPercentage)
    const expGain = (item.SuDung * useAmountNumber * ((100 - reductionPercentage) / 100));

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

    const [userResults, levelResults] = await new Promise((resolve, reject) => {
      db.query(
        'SELECT exp, level FROM users WHERE id = ?', [userId], (error, results) => {
          if (error) {
            return reject(error);
          }
          const userLevel = results[0].level;
          db.query(
            'SELECT exp FROM levels WHERE cap_so = ?', [userLevel], (error, res) => {
              if (error) {
                return reject(error);
              }
              resolve([results[0], res[0]]);
            }
          );
        }
      );
    });
    const progressPercentage = Math.min((userResults.exp / levelResults.exp) * 100, 100);
    return res.status(200).json({ success: true, message: 'Đạo hữu vừa nhận được ' + expGain + ' EXP. Tiến độ tu luyện còn ' + progressPercentage + '%' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred' });
  }
}
