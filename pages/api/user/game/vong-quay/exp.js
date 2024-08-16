import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, prize, amount } = req.body;

    if (!userId || !prize || amount === undefined) {
      return res.status(400).json({ message: 'User ID, prize, and amount are required' });
    }

    let field, operation;
    switch (prize.toLowerCase()) {
      case 'cong bac':
        field = 'tai_san';
        operation = '+';
        break;
      case 'tru bac':
        field = 'tai_san';
        operation = '-';
        break;
      case 'cong exp':
        field = 'exp';
        operation = '+';
        break;
      case 'tru exp':
        field = 'exp';
        operation = '-';
        break;
      default:
        return res.status(400).json({ message: 'Invalid prize type' });
    }

    try {
      // Retrieve the current value of exp or tai_san
      const queryGet = `SELECT ${field} FROM users WHERE id = ?`;
      db.query(queryGet, [userId], (error, results) => {
        if (error || results.length === 0) {
          return res.status(500).json({ message: 'Internal server error', error: error?.message || 'User not found' });
        }

        let currentValue = results[0][field];
        let newValue;

        if (operation === '-') {
          newValue = Math.max(0, currentValue - amount); // Ensure the value doesn't go below 0
        } else {
          newValue = currentValue + amount;
        }

        // Update the user's exp or tai_san
        const queryUpdate = `UPDATE users SET ${field} = ? WHERE id = ?`;
        db.query(queryUpdate, [newValue, userId], (error) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'User updated successfully' });
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
