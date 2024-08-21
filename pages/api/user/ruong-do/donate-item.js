import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { userId, ruongDoId, vatPhamId, donationAmount } = req.body;

  if (!userId || !ruongDoId || !vatPhamId || !donationAmount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    console.log('Starting transaction');
    await new Promise((resolve, reject) => {
      db.query('START TRANSACTION', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    console.log('Fetching user item quantity');
    const results = await new Promise((resolve, reject) => {
      db.query(
        'SELECT so_luong FROM ruong_do WHERE id = ?',
        [ruongDoId],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (!results || results.length === 0) {
      console.log('Item not found in user inventory');
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
      console.log('Not enough quantity to donate:', { userItemQuantity, donationAmount });
      await new Promise((resolve, reject) => {
        db.query('ROLLBACK', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return res.status(400).json({ message: 'Not enough quantity to donate' });
    }

    console.log('Updating user inventory');
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE ruong_do SET so_luong = so_luong - ? WHERE id = ?',
        [donationAmount, ruongDoId],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });

    console.log('Fetching clan ID');
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
      console.log('User is not a member of any clan');
      await new Promise((resolve, reject) => {
        db.query('ROLLBACK', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return res.status(404).json({ message: 'User is not a member of any clan' });
    }

    const clanId = clanResult[0].clan_id;

    console.log('Checking if item exists in clan inventory');
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
      console.log('Updating existing item quantity in clan inventory');
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
      console.log('Inserting item into clan inventory');
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

    console.log('Fetching user ngoai_hieu and item name');
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
    
    console.log('Logging activity in clan_activity_logs');
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details) VALUES (?, ?, ?, ?)',
        [userId, clanId, 'Donate Item', `${displayName} đã nộp bang ${Name} x${donationAmount}`],
        (error) => {
          if (error) {
            return reject(error);
          }
          resolve();
        }
      );
    });
    

    console.log('Committing transaction');
    await new Promise((resolve, reject) => {
      db.query('COMMIT', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    return res.status(200).json({ message: 'Donation successful' });
  } catch (error) {
    console.error('Error during transaction:', error);
    await new Promise((resolve, reject) => {
      db.query('ROLLBACK', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
