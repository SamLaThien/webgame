// pages/api/admin/clan-requests/[id].js
import db from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { action, user_id, clan_id } = req.body;

    if (!action || !["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    try {
      db.query(
        "UPDATE clan_requests SET status = ? WHERE id = ?",
        [action, id],
        (updateError) => {
          if (updateError) {
            return res.status(500).json({
              message: "Internal server error",
              error: updateError.message,
            });
          }

          if (action === "approved") {
            db.query(
              "INSERT INTO clan_members (clan_id, member_id) VALUES (?, ?)",
              [clan_id, user_id],
              (insertError) => {
                if (insertError) {
                  return res.status(500).json({
                    message: "Internal server error",
                    error: insertError.message,
                  });
                }

                db.query(
                  "UPDATE users SET clan_role = 1, bang_hoi = ? WHERE id = ?",
                  [clan_id, user_id],
                  (updateUserError) => {
                    if (updateUserError) {
                      return res.status(500).json({
                        message: "Internal server error",
                        error: updateUserError.message,
                      });
                    }

                    db.query(
                      "SELECT username, ngoai_hieu FROM users WHERE id = ?",
                      [user_id],
                      (fetchUserError, userResults) => {
                        if (fetchUserError || userResults.length === 0) {
                          return res.status(500).json({
                            message: "Internal server error",
                            error:
                              fetchUserError?.message || "User not found",
                          });
                        }

                        const user = userResults[0];
                        const displayName = user.ngoai_hieu || user.username;

                        db.query(
                          "INSERT INTO clan_activity_logs (user_id, clan_id, action_type, action_details, timestamp) VALUES (?, ?, ?, ?, ?)",
                          [
                            user_id,
                            clan_id,
                            "Join Clan",
                            `${displayName} đã gia nhập bang hội`,
                            new Date(),
                          ],
                          (logError) => {
                            if (logError) {
                              return res.status(500).json({
                                message: "Internal server error",
                                error: logError.message,
                              });
                            }

                            return res.status(200).json({
                              message:
                                "Request approved, user added to clan, and activity logged",
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          } else {
            return res.status(200).json({ message: "Request rejected" });
          }
        }
      );
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
