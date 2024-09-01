import db from "@/lib/db";
import jwt from "jsonwebtoken";

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

    db.query(
      `
      UPDATE user_herbs SET isGrown = true WHERE id = ? AND user_id = ?
    `,
      [herbId, userId],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
        }

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "Herb not found or does not belong to the user." });
        }

        return res.status(200).json({ message: "Herb growth status updated successfully!" });
      }
    );
  } catch (error) {
    console.error("Error processing update-grown-status request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
