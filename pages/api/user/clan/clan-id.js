import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    db.query(
      "SELECT clan_id FROM clan_members WHERE member_id = ?",
      [userId],
      (error, results) => {
        if (error) {
          console.error("Database query error:", error.message);
          return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
        }
        if (results.length === 0) {
          return res
            .status(200)
            .json({ message: "User is not a member of any clan" });
        }

        const clanId = results[0].clan_id;
        res.status(200).json({ clan_id: clanId });
      }
    );
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
