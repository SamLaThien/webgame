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

    ///////////////////////////////////luyen dan
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

        const ruongDoResult = await new Promise((resolve, reject) => {
          db.query(
            'SELECT * FROM ruong_do WHERE vat_pham_id = ? AND user_id = ?',
            [medicine.med_id, medicine.user_id],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });

        if (ruongDoResult.length > 0) {
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE ruong_do SET so_luong = so_luong + ? WHERE vat_pham_id = ? AND user_id = ?',
              [quantity, medicine.med_id, medicine.user_id],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        } else {
          await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) VALUES (?, ?, ?)',
              [medicine.med_id, quantity, medicine.user_id],
              (err) => {
                if (err) reject(err);
                resolve();
              }
            );
          });
        }

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

        for (const [level, medId] of Object.entries(Level)) {
          if (user.level >= level && medicine.med_id === medId) {
            let newMedicineLevel = '';
            const levelIndex = Object.keys(Level).indexOf(level);
            if (newSkill >= 100) {
              newMedicineLevel = `Luyện Đan Sư ${levelIndex + 1}`;
            } else {
              newMedicineLevel = `Luyện Đan Sư Học Đồ ${levelIndex + 1}`;
            }

            await new Promise((resolve, reject) => {
              db.query(
                'UPDATE users SET medicine_level = ? WHERE id = ?',
                [newMedicineLevel, medicine.user_id],
                (err) => {
                  if (err) reject(err);
                  resolve();
                }
              );
            });
          }
        }

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

    /////////////////////////////////////duoc vien
    const grownHerbs = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_herbs WHERE endAt <= ? AND isCollected IS FALSE',
        [now],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
    for (const herb of grownHerbs) {
      const so_luong = Math.floor(Math.random() * 7) + 6;

      const ruongDoResult = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM ruong_do WHERE vat_pham_id = ? AND user_id = ?',
          [herb.herb_id, herb.user_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (ruongDoResult.length > 0) {
        await new Promise((resolve, reject) => {
          db.query(
            'UPDATE ruong_do SET so_luong = so_luong + ? WHERE vat_pham_id = ? AND user_id = ?',
            [so_luong, herb.herb_id, herb.user_id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      } else {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO ruong_do (vat_pham_id, so_luong, user_id) VALUES (?, ?, ?)',
            [herb.herb_id, so_luong, herb.user_id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      const herbName = await new Promise((resolve, reject) => {
        db.query('SELECT name FROM herbs WHERE id = ?', [herb.herb_id], (err, results) => {
          if (err) {
            return reject(err);Ư
          }
      
          if (results.length > 0) {
            const herbName = results[0].name; 
            resolve(herbName); 
          } else {
            resolve('Unknown Herb'); 
          }
        });
      });
      
      const actionDetails = `đã thu thập thành công ${so_luong} ${herbName}.`;
      
      
      

      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Herb Collected", ?, NOW())',
          [herb.user_id, actionDetails],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user_herbs SET isCollected = true, isGrown = true WHERE id = ?',
          [herb.id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      console.log(`Collected herb with ID: ${herb.id}`);
    }

  } catch (error) {
    console.error('Error collecting expired medicines or herbs:', error);
  }
});
