import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const query = 'SELECT * FROM wheel_slots';
      db.query(query, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { slot_number, prize_type, prize_value, prize_range, prize_rate, item_id, option_text, background_color, text_color } = req.body;

    if (!slot_number || !prize_type || !prize_rate || !option_text) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    try {
      const query = 'INSERT INTO wheel_slots (slot_number, prize_type, prize_value, prize_range, prize_rate, item_id, option_text, background_color, text_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [slot_number, prize_type, prize_value, prize_range, prize_rate, item_id, option_text, background_color, text_color];
      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(201).json({ message: 'Wheel slot created successfully', id: results.insertId });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
