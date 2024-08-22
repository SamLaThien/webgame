import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let { level } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }

  if (level === null || level === undefined) {
    level = 0;
  }

  try {
    db.query('SELECT * FROM levels WHERE cap_so = ?', [level], async (error, levelResults) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (levelResults.length === 0) {
        return res.status(404).json({ message: 'Level data not found' });
      }

      const levelData = levelResults[0];
      
      const vatPhamIds = levelData.vatpham_bat_buoc ? levelData.vatpham_bat_buoc.split(',') : [];

      if (vatPhamIds.length > 0) {
        db.query('SELECT * FROM vat_pham WHERE ID IN (?)', [vatPhamIds], (vatPhamError, vatPhamResults) => {
          if (vatPhamError) {
            return res.status(500).json({ message: 'Internal server error', error: vatPhamError.message });
          }

          const vatPhamNames = vatPhamResults.map(item => item.Name).join(', ');

          levelData.vatpham_bat_buoc = vatPhamNames;
          levelData.vatpham_bat_buoc_id = vatPhamIds.join(',');

          res.status(200).json(levelData);
        });
      } else {
        res.status(200).json({
          ...levelData,
          vatpham_bat_buoc_id: '' 
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
