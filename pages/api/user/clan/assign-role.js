import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, targetUserId, newRole } = req.body;

  if (!userId || !targetUserId || !newRole) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Get the current user's role
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    // Get the target user's role
    const [targetUser] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [targetUserId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure the user has a higher role than the target user and the new role
    if (parseInt(user.clan_role) <= parseInt(targetUser.clan_role) || parseInt(user.clan_role) <= parseInt(newRole)) {
      return res.status(403).json({ message: 'Insufficient privileges to assign this role' });
    }

    // Update the target user's role
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET clan_role = ? WHERE id = ?', [newRole, targetUserId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    return res.status(200).json({ message: 'Role assigned successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
