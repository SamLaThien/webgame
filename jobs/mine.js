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

function getRandomPrize() {
  const prize = [];
  const noPrizeChance = Math.random() * 100;
  
  if (noPrizeChance <= 30) { g
    return null;
  }
  
  for (const [id, rate] of Object.entries(randomItems)) {
    const randomChance = Math.random() * 100;
    if (randomChance <= rate) {
      const quantity = Math.floor(Math.random() * 10) + 1;
      prize.push(`${id}:${quantity}`);
    }
  }
  return prize.length ? prize.join(", ") : null;
}

async function processMiningRewards() {
  const now = moment().format("YYYY-MM-DD HH:mm:ss");

  const usersMining = await new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM user_mine WHERE isDone = 0 AND endAt <= ?",
      [now],
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  });

  for (const user of usersMining) {
    const prize = getRandomPrize();

    if (prize) {
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE user_mine SET prize = ? WHERE id = ?",
          [prize, user.id], 
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
    }
  }
}

cron.schedule("*/30 * * * *", async () => {
  await processMiningRewards();
});
