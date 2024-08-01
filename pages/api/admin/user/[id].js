// pages/api/admin/user/[id].js
import db from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { id: newId, username, email, role, ...rest } = req.body;

    if (!newId || !username || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Store user data in a temporary variable
      const userData = { id: newId, username, email, role, ...rest };

      // Delete the existing user
      db.query('DELETE FROM users WHERE id = ?', [id], (deleteError, deleteResults) => {
        if (deleteError) {
          return res.status(500).json({ message: 'Internal server error', error: deleteError.message });
        }

        // Insert the new user with the updated ID and stored data
        db.query(
          'INSERT INTO users SET ?',
          userData,
          (insertError, insertResults) => {
            if (insertError) {
              if (insertError.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Duplicate entry for email or id' });
              }
              return res.status(500).json({ message: 'Internal server error', error: insertError.message });
            }

            res.status(200).json({ message: 'User updated successfully' });
          }
        );
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}