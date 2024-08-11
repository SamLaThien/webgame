import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, prize, amount } = req.body;

  if (!userId || !prize || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    let updateQuery = '';
    let params = [];

    if (prize === 'CongBac') {
      updateQuery = 'UPDATE users SET tai_san = tai_san + ? WHERE id = ?';
      params = [amount, userId];
    } else if (prize === 'TruBac') {
      updateQuery = `
        UPDATE users 
        SET tai_san = CASE 
            WHEN tai_san - ? < 0 THEN 0 
            ELSE tai_san - ? 
          END 
        WHERE id = ?`;
      params = [amount, amount, userId];
    } else if (prize === 'CongExp') {
      updateQuery = 'UPDATE users SET exp = exp + ? WHERE id = ?';
      params = [amount, userId];
    } else if (prize === 'TruExp') {
      updateQuery = `
        UPDATE users 
        SET exp = CASE 
            WHEN exp - ? < 0 THEN 0 
            ELSE exp - ? 
          END 
        WHERE id = ?`;
      params = [amount, amount, userId];
    } else {
      return res.status(400).json({ message: 'Invalid prize type' });
    }

    db.query(updateQuery, params, (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      res.status(200).json({ message: 'User updated successfully' });
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
