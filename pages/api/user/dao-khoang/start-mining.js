import db from "@/lib/db";
import jwt from "jsonwebtoken";
import moment from "moment";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { mineAt, hour } = req.body;

    if (!mineAt || !hour) {
      return res.status(400).json({ message: "mineAt and hour are required" });
    }

    // Check if the user is already mining
    const [activeMining] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user_mine WHERE user_id = ? AND isDone = 0",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (activeMining) {
      return res.status(400).json({ message: "You are already mining. Please finish your current session before starting a new one." });
    }

    // Fetch the user's tai_san (money) and check if they have vat_pham_id = 87
    const [userData] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT tai_san FROM users WHERE id = ?",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    const [itemData] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT so_luong, su_dung FROM ruong_do WHERE user_id = ? AND vat_pham_id = 87",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    const hasItem = itemData && itemData.so_luong > 0;
    const costPerHour = hasItem ? 200 : 250; 
    const totalCost = costPerHour * hour;

    if (userData.tai_san < totalCost) {
      return res.status(400).json({ message: `You don't have enough money. You need ${totalCost} but you only have ${userData.tai_san}` });
    }

    if (hasItem) {
      // Check if su_dung is 0, recalculate if necessary
      if (itemData.su_dung === 0 && itemData.so_luong > 0) {
        itemData.su_dung = itemData.so_luong * 10;

        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE ruong_do SET su_dung = ? WHERE user_id = ? AND vat_pham_id = 87",
            [itemData.su_dung, userId],
            (error, results) => {
              if (error) reject(error);
              resolve(results);
            }
          );
        });
      }

      const totalDurability = itemData.su_dung;

      if (hour > totalDurability) {
        return res.status(400).json({ message: `Not enough durability. You can only mine for up to ${totalDurability} hours with the current durability.` });
      }

      // Deduct durability based on the number of hours mined
      let remainingDurability = itemData.su_dung - hour;
      let remainingQuantity = Math.floor(remainingDurability / 10);

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE ruong_do SET so_luong = ?, su_dung = ? WHERE user_id = ? AND vat_pham_id = 87",
          [remainingQuantity, remainingDurability, userId],
          (error, results) => {
            if (error) reject(error);
            resolve(results);
          }
        );
      });
    }

    // Deduct the required money from the user's tai_san
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET tai_san = tai_san - ? WHERE id = ?",
        [totalCost, userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    // Start the mining session
    const currentTime = moment();
    const endAt = currentTime.add(hour, "hours").format("YYYY-MM-DD HH:mm:ss");

    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO user_mine (user_id, mineAt, hour, createAt, endAt, isDone) VALUES (?, ?, ?, NOW(), ?, 0)",
        [userId, mineAt, hour, endAt],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    // Log the start of mining and the amount of money deducted
    const actionDetails = `đã bắt đầu đào khoáng! Đã trừ ${totalCost} tài sản.`;
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp) VALUES (?, "Mining Start", ?, NOW())',
        [userId, actionDetails],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    // Fetch the mining count for the location
    const [mineData] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as miningCount FROM user_mine WHERE mineAt = ? AND isDone = 0",
        [mineAt],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    return res.status(200).json({
      message: "Mining started successfully",
      endAt,
      miningCount: mineData.miningCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
