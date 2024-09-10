import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { method } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const query = `
      SELECT id, name, pham_cap, grow_time, price
      FROM herbs
    `;
    
    db.query(query, async (error, herbs) => {
      if (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }

      if (herbs.length === 0) {
        return res.status(200).json({ message: "No herbs found", herbs: [] });
      }

      const userHerbQuery = `
        SELECT COUNT(*) as herb_count 
        FROM user_herbs 
        WHERE user_id = ? AND isCollected = false
      `;
      
      const userHerbsResult = await new Promise((resolve, reject) => {
        db.query(userHerbQuery, [userId], (err, results) => {
          if (err) reject(err);
          resolve(results[0]);
        });
      });

      const herbCount = userHerbsResult.herb_count;

      if (herbCount > 0) {
        herbs = herbs.map(herb => ({
          ...herb,
          price: herb.price + (50 * herbCount) 
        }));
      }

      return res.status(200).json(herbs);
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Error fetching herbs:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
