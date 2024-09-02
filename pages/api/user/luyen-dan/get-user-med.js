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

    const userMedicines = await new Promise((resolve, reject) => {
      db.query(
        `SELECT um.med_id, um.skill, m.name, m.required_items, m.create_time
         FROM user_medicine um 
         JOIN medicines m ON um.med_id = m.id 
         WHERE um.user_id = ?`,
        [userId],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    const itemsPromises = userMedicines.map(async (medicine) => {
      const requiredItems = medicine.required_items.split(',').map(item => {
        const [itemId, quantity] = item.split(':');
        return { itemId, quantity };
      });

      const itemsDetails = await Promise.all(requiredItems.map(async (item) => {
        const itemName = await new Promise((resolve, reject) => {
          db.query(
            'SELECT Name FROM vat_pham WHERE ID = ?',
            [item.itemId],
            (err, results) => {
              if (err) reject(err);
              resolve(results[0].Name);
            }
          );
        });
        return { ...item, name: itemName };
      }));

      return {
        ...medicine,
        itemsDetails,
      };
    });

    const detailedMedicines = await Promise.all(itemsPromises);

    return res.status(200).json({ medicines: detailedMedicines });
  } catch (error) {
    console.error('Error fetching user medicines:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
