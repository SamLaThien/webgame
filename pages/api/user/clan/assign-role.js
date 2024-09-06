import db from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const { targetUserId, newRole } = req.body;

    if (!userId || !targetUserId || !newRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [user] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    const [targetUser] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [targetUserId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = parseInt(user.clan_role);
    const targetUserRole = parseInt(targetUser.clan_role);
    const newRoleInt = parseInt(newRole);

    console.log(`Role ${userRole}, new role ${newRoleInt}, ${targetUserRole}`);

    if (userRole === 7) {
      if (targetUserRole === 9 && newRoleInt !== 9) {
      } else if (targetUserRole !== 9 && newRoleInt === 9) {
      } else if (userRole <= targetUserRole || userRole <= newRoleInt) {
        return res
          .status(403)
          .json({ message: "Insufficient privileges to assign this role" });
      }
    } else if (userRole <= targetUserRole || userRole <= newRoleInt) {
      return res
        .status(403)
        .json({ message: "Insufficient privileges to assign this role" });
    }

    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET clan_role = ? WHERE id = ?",
        [newRoleInt, targetUserId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    return res.status(200).json({ message: "Role assigned successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
