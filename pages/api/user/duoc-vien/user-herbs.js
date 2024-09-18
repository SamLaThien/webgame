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

    db.query(`
      SELECT uh.id, uh.herb_id, uh.name, uh.pham_cap, uh.grow_time, uh.createdAt, uh.endAt, uh.isGrown, uh.isCollected,
             u.username, u.ngoai_hieu
      FROM user_herbs uh
      JOIN users u ON uh.user_id = u.id
      WHERE uh.user_id = ?
    `, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
      }

      if (results.length === 0) {
        return res.status(200).json([]); 
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error processing user-herbs request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
