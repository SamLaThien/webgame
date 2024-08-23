import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (req.method === 'GET') {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      try {
        const query = 'SELECT ID FROM vat_pham WHERE Name = ?';
        db.query(query, [name], (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          if (results.length === 0) {
            return res.status(404).json({ message: 'Vat Pham not found' });
          }
          res.status(200).json(results[0]);
        });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
