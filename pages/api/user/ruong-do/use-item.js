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

    if (!vatPhamId || !useAmount) {
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
    if (userLevel <= 20) {
      levelRange = '1-20';
    } else if (userLevel <= 30) {
      levelRange = '21-30';
    } else if (userLevel <= 40) {
      levelRange = '31-40';
    } else if (userLevel <= 50) {
      levelRange = '41-50';
    } else if (userLevel <= 60) {
      levelRange = '51-60';
    } else if (userLevel <= 70) {
      levelRange = '61-70';
    } else if (userLevel <= 80) {
      levelRange = '71-80';
    } else if (userLevel <= 90) {
      levelRange = '81-90';
    } else if (userLevel <= 100) {
      levelRange = '91-100';
    } else if (userLevel <= 110) {
      levelRange = '101-110';
    } else if (userLevel <= 120) {
      levelRange = '111-120';
    } else if (userLevel <= 130) {
      levelRange = '121-130';
    } else {
      return res.status(403).json({ message: 'Level out of range' });
    }

    if (!expItems[levelRange] || !expItems[levelRange].includes(vatPhamId)) {
      return res.status(403).json({ message: 'Đạo hữu chưa đạt tu vi sử dụng vật phẩm này' });
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

    if (!itemResult || itemResult.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = itemResult[0];

    let itemLevelRange;
    for (const range in expItems) {
      if (expItems[range].includes(vatPhamId)) {
        itemLevelRange = range;
        break;
      }
    }

    const userRangeStart = parseInt(levelRange.split('-')[0]);
    const itemRangeStart = parseInt(itemLevelRange.split('-')[0]);
    
    let reductionPercentage = Math.max(0, userRangeStart - itemRangeStart) / 10 * 10; 
    
    if (reductionPercentage < 0) {
      reductionPercentage = 0;
    }
    
    const expGain = item.SuDung * useAmount * ((100 - reductionPercentage) / 100);

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

    const actionType = 'Item Use';

const itemNameQuery = 'SELECT Name FROM vat_pham WHERE ID = ?';
const itemNameResult = await new Promise((resolve, reject) => {
  db.query(itemNameQuery, [vatPhamId], (error, results) => {
    if (error) {
      return reject(error);
    }
    resolve(results);
  });
});

if (!itemNameResult || itemNameResult.length === 0) {
  return res.status(404).json({ message: 'Item name not found' });
}

const itemName = itemNameResult[0].Name;

const actionDetails = `vừa sử dụng ${useAmount} ${itemName}. Nhận được ${expGain} EXP.`;

await new Promise((resolve, reject) => {
  const logQuery = `
    INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(logQuery, [userId, actionType, actionDetails], (error) => {
    if (error) {
      return reject(error);
    }
    resolve();
  });
});

    return res.status(200).json({ success: true, message: 'Item used successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
