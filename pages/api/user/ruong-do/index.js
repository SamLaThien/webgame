import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const query = `
      SELECT rd.id AS ruong_do_id, rd.vat_pham_id, vp.Name AS vat_pham_name, rd.so_luong, vp.PhamCap, vp.SuDung, vp.phan_loai
      FROM ruong_do rd
      LEFT JOIN vat_pham vp ON rd.vat_pham_id = vp.ID
      WHERE rd.user_id = ?
    `;
    db.query(query, [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: 'Rương đồ trống' });
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Error fetching ruong do:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
