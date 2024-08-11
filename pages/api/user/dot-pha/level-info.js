import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let { level } = req.body;

  // If level is null, set it to 0
  if (level === null || level === undefined) {
    level = 0;
  }

  try {
    db.query('SELECT * FROM levels WHERE cap_so = ?', [level], async (error, levelResults) => {
      if (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }

      if (levelResults.length === 0) {
        return res.status(404).json({ message: 'Level data not found' });
      }

      const levelData = levelResults[0];
      
      const vatPhamIds = levelData.vatpham_bat_buoc ? levelData.vatpham_bat_buoc.split(',') : [];

      if (vatPhamIds.length > 0) {
        db.query('SELECT * FROM vat_pham WHERE ID IN (?)', [vatPhamIds], (vatPhamError, vatPhamResults) => {
          if (vatPhamError) {
            return res.status(500).json({ message: 'Internal server error', error: vatPhamError.message });
          }

          const vatPhamNames = vatPhamResults.map(item => item.Name).join(', ');

          // Include both names and IDs in the response
          levelData.vatpham_bat_buoc = vatPhamNames;
          levelData.vatpham_bat_buoc_id = vatPhamIds.join(',');

          res.status(200).json(levelData);
        });
      } else {
        // Return only the level data if there are no required items
        res.status(200).json({
          ...levelData,
          vatpham_bat_buoc_id: '' // No required items
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
