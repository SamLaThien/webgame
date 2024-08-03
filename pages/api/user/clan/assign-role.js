import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, targetUserId, newRole } = req.body;

  if (!userId || !targetUserId || !newRole) {
    return res.status(400).json({ message: 'User ID, Target User ID, and New Role are required' });
  }

  try {
    // Get the user's current role
    const [userResult] = await db.query('SELECT clan_role FROM users WHERE id = ?', [userId]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = userResult[0].clan_role || 0;

    // Get the target user's current role
    const [targetUserResult] = await db.query('SELECT clan_role FROM users WHERE id = ?', [targetUserId]);

    if (!targetUserResult || targetUserResult.length === 0) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    const targetUserRole = targetUserResult[0].clan_role || 0;

    // Check if the user has permission to assign the new role
    if (userRole <= targetUserRole || userRole <= newRole) {
      return res.status(403).json({ message: 'You do not have permission to assign this role' });
    }

    // Assign the new role to the target user
    await db.query('UPDATE users SET clan_role = ? WHERE id = ?', [newRole, targetUserId]);

    res.status(200).json({ message: 'Role assigned successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
