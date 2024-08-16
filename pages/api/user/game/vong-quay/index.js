import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, prize, amount, vatPhamId, soLuong } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (prize) {
      // Handle prize type 1 (Exp or Tai San)
      let field;
      if (prize.includes('Exp')) {
        field = 'exp';
      } else if (prize.includes('Bac')) {
        field = 'tai_san';
      }

      if (field) {
        try {
          const query = `UPDATE users SET ${field} = ${field} + ? WHERE id = ?`;
          const values = [amount, userId];
          db.query(query, values, (error) => {
            if (error) {
              return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
            res.status(200).json({ message: 'User updated successfully' });
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      } else {
        return res.status(400).json({ message: 'Invalid prize type' });
      }
    } else if (vatPhamId && soLuong) {
      // Handle prize type 2 (Item)
      try {
        const query = 'INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE so_luong = so_luong + VALUES(so_luong)';
        const values = [vatPhamId, soLuong, userId];
        db.query(query, values, (error) => {
          if (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
          }
          res.status(200).json({ message: 'Item added to ruong_do successfully' });
        });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    } else {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
