import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { addLogs } from '/home/root1/bot/log.js';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { herbId } = req.body;

    if (!herbId) {
      return res.status(400).json({ message: "Herb ID is required" });
    }
    //kiem tra kt
    db.query(`
      SELECT so_luong FROM ruong_do
      WHERE user_id = ? AND vat_pham_id = 87
    `, [userId], (err, itemResult) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
      }

      let newKimThuong = 0;
      let useKimThuong = 0;
      if (itemResult.length !== 0) {
        newKimThuong = itemResult[0].so_luong - 1
        db.query(`
          UPDATE ruong_do SET so_luong = ? WHERE vat_pham_id = 87 AND user_id = ?
        `, [newKimThuong, userId], (err, herbResult) => { });
      } else {
        useKimThuong = 500;
      }

      db.query(`
        SELECT id, name, pham_cap, price, grow_time FROM herbs WHERE id = ?
      `, [herbId], (err, herbResult) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error", error: err.message });
        }

        if (!herbResult || herbResult.length === 0) {
          return res.status(404).json({ message: "Herb not found." });
        }
        const herb = herbResult[0];

        db.query(`
          SELECT COUNT(*) AS count FROM user_herbs 
          WHERE user_id = ? AND herb_id = ? AND isGrown = false
        `, [userId, herbId], (err, countResult) => {
          if (err) {
            return res.status(500).json({ message: "Internal server error", error: err.message });
          }

          let additionalPrice = 0;
          const count = countResult[0].count;
          if (count > 0) {
            additionalPrice = count * 20;
          }

          const herbPrice = herb.price + additionalPrice + useKimThuong;

          db.query(`
            SELECT tai_san, username, ngoai_hieu FROM users WHERE id = ?
          `, [userId], (err, userResult) => {
            if (err) {
              return res.status(500).json({ message: "Internal server error", error: err.message });
            }

            if (!userResult || userResult.length === 0) {
              return res.status(404).json({ message: "User not found." });
            }

            const userMoney = userResult[0].tai_san;
            const username = userResult[0].ngoai_hieu || userResult[0].username;
            if (userMoney < herbPrice) {
              return res.status(403).json({ message: `Bạn không có đủ bạc để trồng!. Cần thêm ${herbPrice - userMoney} bạc.` });
            }

            db.query(`
              UPDATE users SET tai_san = tai_san - ? WHERE id = ?
            `, [herbPrice, userId], (err, result) => {
              if (err) {
                return res.status(500).json({ message: "Internal server error", error: err.message });
              }

              const userActivityQuery = `
                INSERT INTO user_activity_logs (user_id, action_type, action_details, timestamp)
                VALUES (?, ?, ?, NOW())
              `;
              const actionType = "Plant Herb with Shovel";
              let actionDetails = `đã trồng ${herb.name} tốn ${herbPrice} bạc (Còn ${userMoney - herbPrice} bạc).`;
              if (useKimThuong == 0) {
                actionDetails = `đã trồng ${herb.name} tốn ${herbPrice} bạc (Còn ${userMoney - herbPrice} bạc) và 1 Kim Thuổng (Còn ${newKimThuong}).`;
              }

              let message = `Đạo hữu ${username} (ID ${userId}) ${actionDetails}`;
              addLogs(message);
              db.query(userActivityQuery, [userId, actionType, actionDetails], (error) => {
                if (error) {
                  return res.status(500).json({ message: 'Internal server error', error: error.message });
                }

                const createdAt = new Date();
                let endAt = 0;
                if (userId == 5) {
                  endAt = new Date(createdAt.getTime() + 10000);
                } else { endAt = new Date(createdAt.getTime() + herb.grow_time * 60 * 60 * 1000); }

                db.query(`
                  INSERT INTO user_herbs (user_id, herb_id, name, pham_cap, grow_time, createdAt, endAt, isGrown, isCollected, username)
                  VALUES (?, ?, ?, ?, ?, ?, ?, false, false, ?)
                `, [userId, herb.id, herb.name, herb.pham_cap, herb.grow_time, createdAt, endAt, username], (err, result) => {
                  if (err) {
                    return res.status(500).json({ message: "Failed to update user herbs.", error: err.message });
                  }

                  return res.status(200).json({ message: "Trồng thành công!" });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error processing gieo-hat request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
