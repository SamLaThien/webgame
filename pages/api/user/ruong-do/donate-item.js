import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { ruongDoId, vatPhamId, donationAmount } = req.body;

    if (!ruongDoId || !vatPhamId || !donationAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await new Promise((resolve, reject) => {
      db.query('START TRANSACTION', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    const results = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM ruong_do WHERE id = ? AND user_id = ?',
        [ruongDoId, userId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (!results || results.length === 0) {
      await new Promise((resolve, reject) => {
        db.query('ROLLBACK', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return res.status(404).json({ message: 'Item not found in user inventory' });
    }

    const userItemQuantity = results[0].so_luong;

    if (userItemQuantity < donationAmount) {
      await new Promise((resolve, reject) => {
        db.query('ROLLBACK', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return res.status(400).json({ message: 'Not enough quantity to donate' });
    }

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE ruong_do SET so_luong = so_luong - ? WHERE id = ? AND user_id = ?',
        [donationAmount, ruongDoId, userId],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    // Fetch the updated quantity from the user's ruong_do
    const updatedUserItemResults = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM ruong_do WHERE id = ? AND user_id = ?',
        [ruongDoId, userId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    const newUserItemQuantity = updatedUserItemResults[0]?.so_luong || 0;

    if (newUserItemQuantity === 0) {
      await new Promise((resolve, reject) => {
        db.query(
          'DELETE FROM ruong_do WHERE id = ? AND user_id = ?',
          [ruongDoId, userId],
          (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          }
        );
      });
    }

    const clanResult = await new Promise((resolve, reject) => {
      db.query(
        'SELECT clan_id FROM clan_members WHERE member_id = ?',
        [userId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (!clanResult || clanResult.length === 0) {
      await new Promise((resolve, reject) => {
        db.query('ROLLBACK', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return res.status(404).json({ message: 'User is not a member of any clan' });
    }

    const clanId = clanResult[0].clan_id;

    let clanItemQuantity = 0;

    const clanItemResults = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM clan_ruong_do WHERE clan_id = ? AND vat_pham_id = ?',
        [clanId, vatPhamId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (clanItemResults.length > 0) {
      clanItemQuantity = clanItemResults[0].so_luong + donationAmount;
      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE clan_ruong_do SET so_luong = so_luong + ? WHERE clan_id = ? AND vat_pham_id = ?',
          [donationAmount, clanId, vatPhamId],
          (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          }
        );
      });
    } else {
      clanItemQuantity = donationAmount;
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO clan_ruong_do (clan_id, vat_pham_id, so_luong) VALUES (?, ?, ?)',
          [clanId, vatPhamId, donationAmount],
          (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          }
        );
      });
    }

    const userAndItemDetails = await new Promise((resolve, reject) => {
      db.query(
        'SELECT u.ngoai_hieu, u.username, v.Name FROM users u, vat_pham v WHERE u.id = ? AND v.ID = ?',
        [userId, vatPhamId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    const { ngoai_hieu, username, Name } = userAndItemDetails[0];
    const displayName = ngoai_hieu || username;
    const userLink = `<a href="https://tuchangioi.xyz/member/${userId}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;

    const userActionDetails = `đã nộp bang ${donationAmount} ${Name} (còn ${newUserItemQuantity})`;
    const clanActionDetails = `${userLink} đã nộp bang ${donationAmount} ${Name} (còn ${clanItemQuantity})`;

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details) VALUES (?, ?, ?, ?)',
        [userId, clanId, 'Donate Item', clanActionDetails],
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
        'INSERT INTO user_activity_logs (user_id, action_type, action_details) VALUES ( ?, ?, ?)',
        [userId, 'Donate Item', userActionDetails],
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
    await new Promise((resolve, reject) => {
      db.query('ROLLBACK', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
