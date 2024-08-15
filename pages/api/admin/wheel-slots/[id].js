import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { slot_number, prize_type, prize_value, prize_range, prize_rate, item_id, option_text, background_color, text_color } = req.body;

    if (!slot_number || !prize_type || !prize_rate || !option_text) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      const query = 'UPDATE wheel_slots SET slot_number = ?, prize_type = ?, prize_value = ?, prize_range = ?, prize_rate = ?, item_id = ?, option_text = ?, background_color = ?, text_color = ? WHERE id = ?';
      const values = [slot_number, prize_type, prize_value, prize_range, prize_rate, item_id, option_text, background_color, text_color, id];
      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Wheel slot updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const query = 'DELETE FROM wheel_slots WHERE id = ?';
      db.query(query, [id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Wheel slot deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
