import cron from 'node-cron';
import db from '@/lib/db';


function getDanDuoc(id) {
  const cap = {
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    11: 9,
  };
  return cap[id] || id;
}

function queryDatabase(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function LuyenDan(now) {
  const expiredMedicines = await queryDatabase(
    'SELECT * FROM medicine_making WHERE end_at <= ? AND is_done = false',
    [now]
  );

  for (const medicine of expiredMedicines) {
    await queryDatabase(
      'DELETE FROM medicine_making WHERE id = ?',
      [medicine.id]
    );
    const userMedicine = await queryDatabase(
      'SELECT * FROM user_medicine WHERE user_id = ? AND med_id = ?',
      [medicine.user_id, medicine.med_id]
    );

    if (!userMedicine[0]) {
      console.error(`No user_medicine record found for user_id: ${medicine.user_id} and med_id: ${medicine.med_id}`);
      continue;
    }

    const medicineName = (await queryDatabase(
      'SELECT name FROM medicines WHERE id = ?',
      [medicine.med_id]
    ))[0]?.name || 'Unknown Medicine';

    const successRate = userMedicine[0].skill === 100 ? 1.0 :
      (userMedicine[0].skill >= 40 ? 0.8 : 0.4);

    const success = Math.random() < successRate;
    const skillIncrease = Math.floor(Math.random() * 5) + 1;
    const newSkill = Math.min(userMedicine[0].skill + skillIncrease, 100);

    await queryDatabase(
      'UPDATE user_medicine SET skill = ? WHERE user_id = ? AND med_id = ?',
      [newSkill, medicine.user_id, medicine.med_id]
    );

    if (success) {
      const quantity = Math.floor(Math.random() * 7) + 4;

      const ruongDoResult = await queryDatabase(
        'SELECT * FROM ruong_do WHERE vat_pham_id = ? AND user_id = ?',
        [medicine.med_id, medicine.user_id]
      );

      if (ruongDoResult.length > 0) {
        await queryDatabase(
          'UPDATE ruong_do SET so_luong = so_luong + ? WHERE vat_pham_id = ? AND user_id = ?',
          [quantity, medicine.med_id, medicine.user_id]
        );
      } else {
        await queryDatabase(
          'INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) VALUES (?, ?, ?)',
          [medicine.med_id, quantity, medicine.user_id]
        );
      }

      const user = (await queryDatabase(
        'SELECT ngoai_hieu, username, level FROM users WHERE id = ?',
        [medicine.user_id]
      ))[0];

      const actionDetails = `đã luyện thành công và nhận được ${quantity} ${medicineName}.`;

      await queryDatabase(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Medicine Making Completed", ?, NOW())',
        [medicine.user_id, actionDetails]
      );

      const currentLevel = (await queryDatabase(
        'SELECT lds_level FROM users WHERE id = ?',
        [medicine.user_id]
      ))[0].medicine_level;

      if (newSkill >= 100) {
        const lds = getDanDuoc(medicine.med_id);
        if (lds > currentLevel) {
          await queryDatabase(
            'UPDATE users SET lds_level = ? WHERE id = ?',
            [lds, medicine.user_id]
          );
        }
      }
    } else {
      const user = (await queryDatabase(
        'SELECT ngoai_hieu, username FROM users WHERE id = ?',
        [medicine.user_id]
      ))[0];

      const actionDetails = `đã thất bại trong việc luyện chế ${medicineName}.`;

      await queryDatabase(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Medicine Making Failed", ?, NOW())',
        [medicine.user_id, actionDetails]
      );
    }

    console.log(`Processed medicine with ID: ${medicine.id}`);
  }
}

async function DuocVien(now) {
  const grownHerbs = await queryDatabase(
    'SELECT * FROM user_herbs WHERE endAt <= ? AND isCollected IS FALSE',
    [now]
  );

  for (const herb of grownHerbs) {
    await queryDatabase(
      'DELETE FROM user_herbs WHERE id = ?',
      [herb.id]
    );

    const so_luong = Math.floor(Math.random() * 7) + 6;
    let new_count = so_luong; // Start with the quantity being added

    const ruongDoResult = await queryDatabase(
      'SELECT * FROM ruong_do WHERE vat_pham_id = ? AND user_id = ?',
      [herb.herb_id, herb.user_id]
    );

    if (ruongDoResult.length > 0) {
      new_count += ruongDoResult[0].so_luong; // Access the first element's so_luong
      await queryDatabase(
        'UPDATE ruong_do SET so_luong = ? WHERE vat_pham_id = ? AND user_id = ?',
        [new_count, herb.herb_id, herb.user_id]
      );
    } else {
      await queryDatabase(
        'INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) VALUES (?, ?, ?)',
        [herb.herb_id, so_luong, herb.user_id]
      );
    }

    const herbName = (await queryDatabase(
      'SELECT name FROM herbs WHERE id = ?',
      [herb.herb_id]
    ))[0]?.name || 'Unknown Herb';

    const actionDetails = `vừa thu hoạch được ${so_luong} ${herbName} (Còn ${new_count}).`;

    await queryDatabase(
      'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Herb Collected", ?, NOW())',
      [herb.user_id, actionDetails]
    );

    console.log(`Collected herb with ID: ${herb.id}`);
  }
}


async function cleanUpDuocVien(now) {
  const usersWithHerbs = await queryDatabase(
    'SELECT DISTINCT user_id FROM user_herbs'
  );

  for (const { user_id } of usersWithHerbs) {
    const lastEndAt = (await queryDatabase(
      'SELECT endAt FROM user_herbs WHERE user_id = ? ORDER BY endAt DESC LIMIT 1',
      [user_id]
    ))[0]?.endAt || null;

    if (!lastEndAt) continue;

    const timeDifference = (now - new Date(lastEndAt)) / (1000 * 60 * 60);

    if (timeDifference >= 12) {
      await queryDatabase(
        'DELETE FROM user_herbs WHERE user_id = ?',
        [user_id]
      );

      console.log(`Deleted all herbs for user_id: ${user_id} as 12 hours passed since last plant`);
    }
  }
}

cron.schedule('* * * * * *', async () => {

  try {
    const now = new Date();
    await LuyenDan(now);
    await DuocVien(now);
    await cleanUpDuocVien(now);
  } catch (error) {
    console.error('Error collecting expired medicines or herbs:', error);
  }
});
