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
      const spinToken = jwt.sign(
        { userId, spin: true },
        process.env.JWT_SECRET,
        { expiresIn: '6s' } 
      );

      return res.status(200).json({ spinToken });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
