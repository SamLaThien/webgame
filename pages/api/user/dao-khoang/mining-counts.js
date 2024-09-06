import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const [miningCount] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT mineAt, COUNT(*) as count 
         FROM user_mine 
         WHERE isDone = false 
         GROUP BY mineAt`,
        [],
        (error, results) => {
          if (error) reject(error);
          resolve([results]);
        }
      );
    });

    return res.status(200).json({
      message: "Mining count fetched successfully",
      miningCount,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
