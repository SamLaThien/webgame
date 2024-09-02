import db from '@/lib/db';
import jwt from 'jsonwebtoken';

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

    const user = await new Promise((resolve, reject) => {
      db.query('SELECT level FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userLevel = user.level;

    const Level = {
      35: 3,
      45: 4,
      55: 5,
      65: 6,
      75: 7,
      85: 8,
      95: 9,
      105: 10,
    };

    const availableMeds = [];
    for (const [level, medId] of Object.entries(Level)) {
      if (userLevel >= level) {
        availableMeds.push(medId);
      }
    }

    const userMedicines = await new Promise((resolve, reject) => {
      db.query(
        'SELECT med_id FROM user_medicine WHERE user_id = ? AND med_id IN (?)',
        [userId, availableMeds],
        (err, results) => {
          if (err) reject(err);
          resolve(results.map((row) => row.med_id));
        }
      );
    });

    const missingMeds = availableMeds.filter((medId) => !userMedicines.includes(medId));

    if (missingMeds.length > 0) {
      const missingMedData = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM medicines WHERE id IN (?)',
          [missingMeds],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      return res.status(200).json({ missingMedicines: missingMedData });
    } else {
      return res.status(200).json({ message: 'No missing medicines for this user' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
