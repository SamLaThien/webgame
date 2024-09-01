import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import moment from 'moment';

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
      try {
        await db.query('START TRANSACTION');

        const userResult = await db.query('SELECT level, last_exp_update FROM users WHERE id = ?', [userId]);
        const user =userResult;

        if (!user) {
          await db.query('ROLLBACK');
          return res.status(404).json({ message: 'User not found' });
        }

        const lastUpdate = moment(user.last_exp_update);
        const now = moment();
        if (lastUpdate) {
          const minutesSinceLastUpdate = now.diff(moment(lastUpdate), 'minutes');
          console.log(now.diff(moment(lastUpdate), 'minutes'));
          if (minutesSinceLastUpdate < 30) {
            await db.query('ROLLBACK');
            return res.status(429).json({ message: `EXP update can only be done every 30 minutes. Please wait another ${30 - minutesSinceLastUpdate} minutes.` });
          }
        }

        const level = user.level;
        const cap = Math.floor(level / 10) + 1;
        let tile = 1;

        switch (cap) {
          case 1:
            tile = 1.1;
            break;
          case 2:
            tile = 1.2;
            break;
          case 3:
            tile = 1.3;
            break;
          case 4:
            tile = 2.6;
            break;
          case 5:
            tile = 4.2;
            break;
          case 6:
            tile = 10.5;
            break;
          case 7:
            tile = 21;
            break;
          case 8:
            tile = 70;
            break;
          case 9:
            tile = 210;
            break;
          default:
            tile = 1;
        }

        const expToAdd = 1 / (48 * tile);

        const updateUserExpQuery = 'UPDATE users SET exp = CAST(exp AS FLOAT) + ?, last_exp_update = ? WHERE id = ?';
        await db.query(updateUserExpQuery, [expToAdd, now.format('YYYY-MM-DD HH:mm:ss'), userId]);

        const userClanResult = await db.query('SELECT clan_id FROM clan_members WHERE member_id = ?', [userId]);
        const clanId = Array.isArray(userClanResult) && userClanResult.length > 0 ? userClanResult[0].clan_id : null;

        if (clanId) {
          const updateClanManaQuery = 'UPDATE clans SET clan_mana = CAST(clan_mana AS FLOAT) - ? WHERE id = ?';
          await db.query(updateClanManaQuery, [expToAdd, clanId]);
        }

        await db.query('COMMIT');

        return res.status(200).json({ message: 'EXP updated and clan mana deducted successfully', expAdded: expToAdd });
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
