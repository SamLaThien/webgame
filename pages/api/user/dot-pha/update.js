import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: 'Authorization header is required' });
    }

    const token = authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const { expToAdd } = req.body;

      if (expToAdd === undefined) {
        return res.status(400).json({ message: 'expToAdd is required' });
      }

      try {
        await db.query('START TRANSACTION');

        const updateUserExpQuery = 'UPDATE users SET exp = CAST(exp AS FLOAT) + ? WHERE id = ?';
        const userUpdateResult = await db.query(updateUserExpQuery, [expToAdd, userId]);
        console.log('User EXP update result:', userUpdateResult);

        const userClanResult = await new Promise((resolve, reject) => {
          db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId], (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          });
        });

        console.log('User clan result:', userClanResult);

        const clanId = userClanResult.length > 0 ? userClanResult[0].clan_id : null;
        console.log('Clan ID:', clanId);

        if (clanId) {
          const updateClanManaQuery = 'UPDATE clans SET clan_mana = CAST(clan_mana AS FLOAT) - ? WHERE id = ?';
          console.log(`Executing SQL: UPDATE clans SET clan_mana = CAST(clan_mana AS FLOAT) - ${expToAdd} WHERE id = ${clanId}`);
          const clanUpdateResult = await db.query(updateClanManaQuery, [expToAdd, clanId]);
          console.log('Clan mana update result:', clanUpdateResult);
        }

        await db.query('COMMIT');
        console.log('Transaction committed successfully.');

        return res.status(200).json({ message: 'EXP updated and clan mana deducted successfully' });
      } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error updating user EXP and clan mana:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
