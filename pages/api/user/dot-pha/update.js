import db from "@/lib/db";
import jwt from "jsonwebtoken";
import moment from "moment";

const dbQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Authorization header is required" });
  }

  const token = authorization.split(" ")[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    await dbQuery("START TRANSACTION");

    const userResult = await dbQuery("SELECT * FROM users WHERE id = ?", [userId]);
    if (!userResult.length) {
      await dbQuery("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult[0];
    const now = moment();
    const lastUpdate = moment(user.last_exp_update);
    const minutesSinceLastUpdate = now.diff(lastUpdate, 'minutes');

    if (minutesSinceLastUpdate < 30) {
      await dbQuery("ROLLBACK");
      return res.status(200).json({ message: `Please wait another ${30 - minutesSinceLastUpdate} minutes.` });
    }

    const level = req.body.level;
    const levelResults = await dbQuery('SELECT * FROM levels WHERE cap_so = ?', [level]);
    if (!levelResults.length) {
      await dbQuery("ROLLBACK");
      return res.status(404).json({ message: 'Level data not found' });
    }

    const expData = levelResults[0].exp;
    const cap = Math.floor(level / 10) + 1;
    const tileMap = [1.1, 1.2, 1.3, 2.6, 4.2, 10.5, 21, 70, 210];
    const tile = tileMap[cap - 1] || 1;

    const expToAdd = Math.round(expData / (48 * tile));
    await dbQuery("UPDATE users SET exp = exp + ?, last_exp_update = ? WHERE id = ?", [
      expToAdd,
      now.format("YYYY-MM-DD HH:mm:ss"),
      userId,
    ]);

    const userClanResult = await dbQuery("SELECT clan_id FROM clan_members WHERE member_id = ?", [userId]);
    const clanId = userClanResult[0]?.clan_id;

    if (clanId) {
      await dbQuery("UPDATE clans SET clan_mana = clan_mana - ? WHERE id = ?", [expToAdd, clanId]);
    }

    await dbQuery("COMMIT");
    return res.status(200);
  } catch (error) {
    await dbQuery("ROLLBACK");
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
}
