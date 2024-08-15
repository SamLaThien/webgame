import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const query = 'SELECT * FROM wheel_slot_groups';
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
    const { slot_number, group_name, background_color, text_color } = req.body;
    
    if (!slot_number || !group_name || !background_color || !text_color) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
      const query = 'INSERT INTO wheel_slot_groups (slot_number, group_name, background_color, text_color) VALUES (?, ?, ?, ?)';
      const values = [slot_number, group_name, background_color, text_color];
      db.query(query, values, (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
