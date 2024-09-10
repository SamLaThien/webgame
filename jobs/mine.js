import db from "@/lib/db";
import moment from "moment";
import cron from "node-cron";

const randomItems = {
  12: 50, 
  13: 10, 
  14: 5, 
  15: 1,
  122: 50, 
  123: 10, 
  124: 5, 
  125: 1
};

cron.schedule("*/30 * * * *", async () => {
  try {
    const now = moment(); 

    const usersMining = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM user_mine WHERE isDone = 0`, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    for (const user of usersMining) {
      const endAtTime = moment(user.endAt);

      if (now.isSameOrAfter(endAtTime)) {
        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE user_mine SET isDone = 1 WHERE id = ?",
            [user.id],
            (error, results) => {
              if (error) reject(error);
              resolve(results);
            }
          );
        });
      } else {
        const successChance = Math.random() * 100;
        let prize = [];

        if (successChance <= 70) {
          for (const [id, rate] of Object.entries(randomItems)) {
            const randomChance = Math.random() * 100;
            if (randomChance <= rate) {
              const maxQuantity = Math.floor(6 - rate / 10);
              const quantity = Math.floor(Math.random() * maxQuantity) + 1;
              prize.push({ id, quantity });
            }
          }
        }

        if (prize.length > 0) {
          const prizeStrings = [];

          for (const item of prize) {
            const itemName = await new Promise((resolve, reject) => {
              db.query("SELECT Name FROM vat_pham WHERE ID = ?", [item.id], (error, results) => {
                if (error) reject(error);
                resolve(results[0]?.Name || "Unknown Item");
              });
            });

            const actionDetails = `vừa đào được ${item.quantity} ${itemName}.`;

            await new Promise((resolve, reject) => {
              db.query(
                'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Mining Success", ?, NOW())',
                [user.user_id, actionDetails],
                (err) => {
                  if (err) reject(err);
                  resolve();
                }
              );
            });

            const existingItem = await new Promise((resolve, reject) => {
              db.query(
                "SELECT * FROM ruong_do WHERE user_id = ? AND vat_pham_id = ?",
                [user.user_id, item.id],
                (error, results) => {
                  if (error) reject(error);
                  resolve(results[0]);
                }
              );
            });

            if (existingItem) {
              const newQuantity = existingItem.so_luong + item.quantity;
              await new Promise((resolve, reject) => {
                db.query(
                  "UPDATE ruong_do SET so_luong = ? WHERE user_id = ? AND vat_pham_id = ?",
                  [newQuantity, user.user_id, item.id],
                  (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                  }
                );
              });
            } else {
              await new Promise((resolve, reject) => {
                db.query(
                  "INSERT INTO ruong_do (user_id, vat_pham_id, so_luong) VALUES (?, ?, ?)",
                  [user.user_id, item.id, item.quantity],
                  (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                  }
                );
              });
            }

            prizeStrings.push(`${item.id}:${item.quantity}`);
          }

          const prizeValue = prizeStrings.join(", ");

          await new Promise((resolve, reject) => {
            db.query(
              "UPDATE user_mine SET prize = ? WHERE id = ?",
              [prizeValue, user.id],
              (error, results) => {
                if (error) reject(error);
                resolve(results);
              }
            );
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing mining rewards:", error);
  }
});
