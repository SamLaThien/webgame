import bcrypt from 'bcryptjs';
import axios from 'axios';
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password, recaptchaToken, role } = req.body;

  if (!username || !email || !password || !recaptchaToken) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying reCAPTCHA', error });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Determine the starting ID based on role
  const startingId = role === 1 ? 1 : 100;

  try {
    db.query(
      'SELECT MAX(id) AS maxId FROM users WHERE id >= ?',
      [startingId],
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error });
        }

        const newId = results[0].maxId ? results[0].maxId + 1 : startingId;

        db.query(
          'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [newId, username, email, hashedPassword, role],
          (error) => {
            if (error) {
              if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Email already in use' });
              } else {
                return res.status(500).json({ message: 'Internal server error', error });
              }
            }

            res.status(201).json({ message: 'User created successfully' });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
}
