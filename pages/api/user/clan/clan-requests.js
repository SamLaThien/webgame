import db from '@/lib/db';

export default async function handler(req, res) {
  console.log('API request received:', req.method);

  if (req.method === 'POST') {
    const { username, clan_id } = req.body;
    console.log('Received data:', { username, clan_id });

    if (!username || !clan_id) {
      console.error('Username or Clan ID is missing');
      return res.status(400).json({ message: 'Username and Clan ID are required' });
    }

    try {
      db.query('SELECT id FROM users WHERE username = ?', [username], (error, results) => {
        if (error || results.length === 0) {
          console.error('User not found or internal server error:', error ? error.message : 'User not found');
          return res.status(500).json({ message: 'User not found or internal server error', error: error ? error.message : null });
        }

        const user_id = results[0].id;
        console.log('Fetched user ID:', user_id);

        db.query(
          'INSERT INTO clan_requests (user_id, clan_id) VALUES (?, ?)',
          [user_id, clan_id],
          (error, results) => {
            if (error) {
              console.error('Error inserting into clan_requests:', error.message);
              return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
            console.log('Clan request created successfully');
            res.status(201).json({ message: 'Clan request created successfully' });
          }
        );
      });
    } catch (error) {
      console.error('Internal server error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
