import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, username, bio, dateOfBirth, gender, image, ngoai_hieu, danh_hao, tai_san } = req.body;

  console.log('Received data:', { userId, username, bio, dateOfBirth, gender, image, ngoai_hieu, danh_hao, tai_san });

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const updates = [];
  const values = [];

  if (username !== undefined) {
    updates.push('name = ?');
    values.push(username);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (dateOfBirth !== undefined) {
    updates.push('dateOfBirth = ?');
    values.push(dateOfBirth);
  }
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender);
  }
  if (image !== undefined) {
    updates.push('image = ?');
    values.push(image);
  }
  if (ngoai_hieu !== undefined) {
    updates.push('ngoai_hieu = ?');
    values.push(ngoai_hieu);
  }
  if (danh_hao !== undefined) {
    updates.push('danh_hao = ?');
    values.push(danh_hao);
  }
  if (tai_san !== undefined) {
    updates.push('tai_san = ?');
    values.push(tai_san);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  values.push(userId);

  try {
    db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values,
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
