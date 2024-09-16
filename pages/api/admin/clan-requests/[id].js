import db from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { action, user_id, clan_id } = req.body;

    if (!action || !["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    try {
      // Update the status of the clan request
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE clan_requests SET status = ? WHERE id = ?",
          [action, id],
          (updateError) => {
            if (updateError) {
              return reject({
                status: 500,
                message: "Internal server error",
                error: updateError.message,
              });
            }
            resolve();
          }
        );
      });

      if (action === "approved") {
        // Check if the user already exists in the clan_members table
        const checkQuery = 'SELECT * FROM clan_members WHERE member_id = ?';
        const results = await new Promise((resolve, reject) => {
          db.query(checkQuery, [user_id], (err, results) => {
            if (err) {
              return reject({
                status: 500,
                message: "Internal server error",
                error: err.message,
              });
            }
            resolve(results);
          });
        });

        if (results.length > 0) {
          // If the user exists, update the clan_id
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE clan_members SET clan_id = ? WHERE member_id = ?',
              [clan_id, user_id],
              (updateErr) => {
                if (updateErr) {
                  return reject({
                    status: 500,
                    message: "Internal server error",
                    error: updateErr.message,
                  });
                }
                resolve();
              }
            );
          });
        } else {
          // If the user does not exist, insert a new record
          await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)',
              [clan_id, user_id],
              (insertErr) => {
                if (insertErr) {
                  return reject({
                    status: 500,
                    message: "Internal server error",
                    error: insertErr.message,
                  });
                }
                resolve();
              }
            );
          });

          // Update the user's clan_role and bang_hoi
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE users SET clan_role = 1, bang_hoi = ? WHERE id = ?',
              [clan_id, user_id],
              (updateUserError) => {
                if (updateUserError) {
                  return reject({
                    status: 500,
                    message: "Internal server error",
                    error: updateUserError.message,
                  });
                }
                resolve();
              }
            );
          });

          // Fetch the user's details
          const userResults = await new Promise((resolve, reject) => {
            db.query(
              'SELECT username, ngoai_hieu FROM users WHERE id = ?',
              [user_id],
              (fetchUserError, results) => {
                if (fetchUserError || results.length === 0) {
                  return reject({
                    status: 500,
                    message: "Internal server error",
                    error: fetchUserError?.message || "User not found",
                  });
                }
                resolve(results[0]);
              }
            );
          });

          const user = userResults;
          const displayName = user.ngoai_hieu || user.username;
          const displayNameWithLink = `<a href="https://tuchangioi.xyz/member/${user_id}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: black; font-weight:500">${displayName}</a>`;

          // Log the activity
          await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp) VALUES (?, ?, ?, ?, ?)',
              [
                user_id,
                clan_id,
                'Join Clan',
                `${displayNameWithLink} đã gia nhập bang hội`,
                new Date(),
              ],
              (logError) => {
                if (logError) {
                  return reject({
                    status: 500,
                    message: "Internal server error",
                    error: logError.message,
                  });
                }
                resolve();
              }
            );
          });
        }

        return res.status(200).json({
          message: "Request approved, user added to clan, and activity logged",
        });
      } else {
        return res.status(200).json({ message: "Request rejected" });
      }
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || "Internal server error",
        error: error.error,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
