import cron from 'node-cron';
import db from '@/lib/db';

const Level = {
  35: 3,
  45: 4,
  55: 5,
  65: 6,
  75: 7,
  85: 8,
  95: 9,
  105: 10
};

cron.schedule('* * * * * *', async () => {
  try {
    const now = new Date();
    const expiredMedicines = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM medicine_making WHERE end_at <= ? AND is_done = false',
        [now],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    for (const medicine of expiredMedicines) {
      const userMedicine = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM user_medicine WHERE user_id = ? AND med_id = ?',
          [medicine.user_id, medicine.med_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results[0]);
          }
        );
      });

      if (!userMedicine) {
        console.error(`No user_medicine record found for user_id: ${medicine.user_id} and med_id: ${medicine.med_id}`);
        continue;
      }

      const medicineName = await new Promise((resolve, reject) => {
        db.query(
          'SELECT name FROM medicines WHERE id = ?',
          [medicine.med_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results[0]?.name || 'Unknown Medicine');
          }
        );
      });

      let successRate = 0.8; 
      if (userMedicine.skill >= 100) {
        successRate = 1.0; 
      }

      const success = Math.random() < successRate;

      const skillIncrease = Math.floor(Math.random() * 10) + 1;
      const newSkill = Math.min(userMedicine.skill + skillIncrease, 100); 

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user_medicine SET skill = ? WHERE user_id = ? AND med_id = ?',
          [newSkill, medicine.user_id, medicine.med_id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      if (success) {
        const quantity = Math.floor(Math.random() * 7) + 4; 

        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO ruong_do (user_id, vat_pham_id, so_luong) VALUES (?, ?, ?)',
            [medicine.user_id, medicine.med_id, quantity],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

        const user = await new Promise((resolve, reject) => {
          db.query(
            'SELECT ngoai_hieu, username, level FROM users WHERE id = ?',
            [medicine.user_id],
            (err, results) => {
              if (err) reject(err);
              resolve(results[0]);
            }
          );
        });

        const actionDetails = `đã luyện đan thành công và nhận được ${quantity} ${medicineName}.`;

        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Medicine Making Completed", ?, NOW())',
            [medicine.user_id, actionDetails],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });

      } else {
        const user = await new Promise((resolve, reject) => {
          db.query(
            'SELECT ngoai_hieu, username FROM users WHERE id = ?',
            [medicine.user_id],
            (err, results) => {
              if (err) reject(err);
              resolve(results[0]);
            }
          );
        });

        const actionDetails = `đã thất bại trong việc luyện đan "${medicineName}".`;

        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Medicine Making Failed", ?, NOW())',
            [medicine.user_id, actionDetails],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE medicine_making SET is_done = true WHERE id = ?',
          [medicine.id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      console.log(`Processed medicine with ID: ${medicine.id}`);
    }

  } catch (error) {
    console.error('Error collecting expired medicines:', error);
  }
});
