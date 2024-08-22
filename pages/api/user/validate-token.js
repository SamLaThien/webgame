import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    return res.status(200).json({ isValid: true, userId: decoded.userId, role: decoded.role });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ isValid: false, message: 'Invalid or expired token' });
  }
}
