import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { expItems } from '@/utils/expItem';

// Function to wrap database queries in a promise
const dbQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

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
    const useAmountNumber = Number(useAmount);

    if (!vatPhamId || isNaN(useAmountNumber)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Query for user level and item data in a single query
    const query = `
      SELECT u.level AS userLevel, rd.so_luong, vp.SuDung, vp.ID AS itemId
      FROM users u
      LEFT JOIN ruong_do rd ON rd.user_id = u.id
      LEFT JOIN vat_pham vp ON rd.vat_pham_id = vp.ID
      WHERE u.id = ? AND rd.vat_pham_id = ?
    `;
    const [results] = await dbQuery(query, [userId, vatPhamId]);
    
    const { userLevel, so_luong, SuDung, itemId } = results;
    console.log(userLevel)
    // Determine level range
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

    if (vatPhamIdNumber === 1) levelRange = 0;

    // Determine item level range
    const itemLevel = Object.keys(expItems).find(range =>
      expItems[range].includes(vatPhamIdNumber)
    );

    if (parseInt(itemLevel) > levelRange + 1) {
      return res.status(200).json({ message: 'Đạo hữu không đủ cấp bậc để sử dụng. Cố sử dụng sẽ bạo thể mà chết.' });
    }

    let itemLevelRange = Object.keys(expItems).find(range =>
      expItems[range].includes(vatPhamIdNumber)
    );
    if (!itemLevelRange) {
      return res.status(400).json({ message: 'Invalid item level range' });
    }

    let reductionPercentage = Math.max(0, levelRange - parseInt(itemLevelRange)) * 10;
    if (parseInt(itemLevelRange) === 0) reductionPercentage = 1;

    const expGain = SuDung * useAmountNumber * ((100 - reductionPercentage) / 100);

    // Update user experience and item quantity
    await dbQuery(`
      UPDATE users u
      JOIN ruong_do rd ON rd.user_id = u.id
      SET u.exp = u.exp + ?, rd.so_luong = rd.so_luong - ?
      WHERE u.id = ? AND rd.vat_pham_id = ?
    `, [expGain, useAmount, userId, vatPhamId]);

    // Retrieve updated user experience and level
    const [userResults] = await dbQuery('SELECT exp, level FROM users WHERE id = ?', [userId]);
    const [levelResults] = await dbQuery('SELECT exp FROM levels WHERE cap_so = ?', [userResults.level]);

    const progressPercentage = Math.min((userResults.exp / levelResults.exp) * 100, 100);

    return res.status(200).json({
      success: true,
      message: `Đạo hữu vừa nhận được ${expGain} EXP. Tiến độ tu luyện còn ${progressPercentage.toFixed(2)}%`,
      exp: expGain
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}
