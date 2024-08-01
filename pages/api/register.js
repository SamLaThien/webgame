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
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    return res.status(500).json({ message: 'Error verifying reCAPTCHA', error: error.message });
  }

  try {
    // Check if the username or email already exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (error, results) => {
      if (error) {
        console.error('Error querying database:', error.message);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Username or email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Determine the starting ID based on role
      const startingId = role === 1 ? 1 : 100;

      db.query(
        'SELECT MAX(id) AS maxId FROM users WHERE id >= ?',
        [startingId],
        (error, results) => {
          if (error) {
            console.error('Error querying database:', error.message);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }

          const newId = results[0].maxId ? results[0].maxId + 1 : startingId;

          db.query(
            'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [newId, username, email, hashedPassword, role],
            (error) => {
              if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                  return res.status(409).json({ message: 'Username or email already in use' });
                } else {
                  console.error('Error inserting into database:', error.message);
                  return res.status(500).json({ message: 'Internal server error', error: error.message });
                }
              }

              res.status(201).json({ message: 'User created successfully' });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Error during database operation:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
