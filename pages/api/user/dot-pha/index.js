import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, exp } = req.body;

    if (!userId || exp === undefined) {
      return res.status(400).json({ message: 'User ID and EXP are required' });
    }

    try {
      const [user] = await db.query('SELECT exp, level FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const [levels] = await db.query('SELECT * FROM levels ORDER BY exp ASC');
      let newLevel = user.level;
      let newExp = exp;
      for (let level of levels) {
        if (newExp >= level.exp) {
          newLevel = level.id;
          newExp = newExp - level.exp;
        } else {
          break;
        }
      }

      await db.query('UPDATE users SET exp = ?, level = ? WHERE id = ?', [newExp, newLevel, userId]);
      res.status(200).json({ success: true, exp: newExp, level: newLevel });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
