import db from '@/lib/db';
import bcrypt from 'bcryptjs/dist/bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (req.method === 'POST') {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const query = 'UPDATE users SET password = ? WHERE id = ?';
      db.query(query, [hashedPassword, userId], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        res.status(200).json({ message: 'Password changed successfully' });
      });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
}
