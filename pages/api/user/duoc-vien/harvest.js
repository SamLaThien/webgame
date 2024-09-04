// import db from "@/lib/db";
// import jwt from "jsonwebtoken";

// export default async function handler(req, res) {
//   const { method } = req;

//   if (method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Authorization token is required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;
//     const { herbId } = req.body;

//     if (!herbId) {
//       return res.status(400).json({ message: "Herb ID is required" });
//     }

//     db.query(
//       `
//       SELECT * FROM user_herbs
//       WHERE id = ? AND user_id = ?
//     `,
//       [herbId, userId],
//       (err, results) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ message: "Internal server error", error: err.message });
//         }

//         if (results.length === 0) {
//           return res
//             .status(404)
//             .json({ message: "Herb not found or does not belong to the user." });
//         }

//         const herb = results[0];
//         const currentTime = new Date();

//         if (currentTime < new Date(herb.endAt)) {
//           return res.status(403).json({
//             message: "Herb is not fully grown yet. Please wait until the growth period is complete."
//           });
//         }

//         if (herb.isCollected) {
//           return res
//             .status(403)
//             .json({ message: "Herb has already been collected." });
//         }

//         db.query(
//           `
//           UPDATE user_herbs SET isCollected = true WHERE id = ?
//         `,
//           [herbId],
//           (err, result) => {
//             if (err) {
//               return res
//                 .status(500)
//                 .json({ message: "Internal server error", error: err.message });
//             }

//             const so_luong = Math.floor(Math.random() * 7) + 6;

//             db.query(
//               `
//               SELECT * FROM ruong_do 
//               WHERE vat_pham_id = ? AND user_id = ?
//             `,
//               [herb.herb_id, userId],
//               (err, ruongDoResult) => {
//                 if (err) {
//                   return res
//                     .status(500)
//                     .json({ message: "Internal server error", error: err.message });
//                 }

//                 if (ruongDoResult.length > 0) {
//                   db.query(
//                     `
//                     UPDATE ruong_do 
//                     SET so_luong = so_luong + ? 
//                     WHERE vat_pham_id = ? AND user_id = ?
//                   `,
//                     [so_luong, herb.herb_id, userId],
//                     (err, updateResult) => {
//                       if (err) {
//                         return res
//                           .status(500)
//                           .json({ message: "Internal server error", error: err.message });
//                       }

//                       return res.status(200).json({ message: "Herb collected and quantity updated in ruong_do successfully!" });
//                     }
//                   );
//                 } else {
//                   db.query(
//                     `
//                     INSERT INTO ruong_do (vat_pham_id, so_luong, user_id)
//                     VALUES (?, ?, ?)
//                   `,
//                     [herb.herb_id, so_luong, userId],
//                     (err, insertResult) => {
//                       if (err) {
//                         return res
//                           .status(500)
//                           .json({ message: "Internal server error", error: err.message });
//                       }

//                       return res.status(200).json({ message: "Herb collected and added to ruong_do successfully!" });
//                     }
//                   );
//                 }
//               }
//             );
//           }
//         );
//       }
//     );
//   } catch (error) {
//     console.error("Error processing collect request:", error);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// }
