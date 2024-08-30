import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }

  const { accountantId, amount } = req.body;

  if (!userId || !accountantId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid or missing parameters' });
  }

  try {
    const taxRate = 0.02;
    const taxAmount = amount * taxRate;
    const amountAfterTax = amount - taxAmount;
    const userResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT tai_san, ngoai_hieu, username FROM users WHERE id = ?',
        [userId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult[0];
    const currentTaiSan = user.tai_san;

    if (currentTaiSan < amount) {
      return res.status(400).json({ message: 'Insufficient tai_san for this donation' });
    }

    const userIdentifier = user.ngoai_hieu || user.username;

    await new Promise((resolve, reject) => {
      db.query('START TRANSACTION', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET tai_san = tai_san - ? WHERE id = ?',
        [amount, userId],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET tai_san = tai_san + ? WHERE id = ?',
        [amountAfterTax, accountantId],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp) VALUES (?, (SELECT clan_id FROM clan_members WHERE member_id = ?), ?, ?, NOW())',
        [userId, userId, 'Donate Money', `${userIdentifier} đã nộp vào ngân khố bang ${amountAfterTax} bạc`],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, clan_id, action_type, action_details) VALUES (?, ?, ?, ?)',
        [userId, clanId, 'Donate Moeny', `Đạo hữu đã nộp bang ${amountAfterTax} bạc`],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query('COMMIT', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    return res.status(200).json({ message: 'Donation successful' });
  } catch (error) {
    console.error('Error during donation:', error);
    await new Promise((resolve, reject) => {
      db.query('ROLLBACK', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
