import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import db from '../../lib/db';
import cryptoJs from 'crypto-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, recaptchaToken } = req.body;

  if (!username || !password || !recaptchaToken) {
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

  try {
    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = results[0];

      // if (user.active === 0) {
      //   return res.status(403).json({ message: 'Bạn chưa kích hoạt tài khoản!' });
      // }

      if (user.ban === 1) {
        return res.status(403).json({ message: 'Your account has been banned' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const encryptedUserData = cryptoJs.AES.encrypt(
        JSON.stringify({ id: user.id, name: user.username, image: user.image, role: user.role, ngoai_hieu: user.ngoai_hieu }),
        process.env.AES_SECRET_KEY
      ).toString();

      res.status(200).json({ message: 'Login successful', token, user: encryptedUserData });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
}
