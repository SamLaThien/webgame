import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    const { authorization } = req.headers;
    console.log(authorization);

    if (!authorization) {
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    try {
        // Initialize an empty array to store the top users by level and tai_san
        let dsTop = { topUsers: [], topTaiSans: [], topLuyenDans: [], TopLuyenKhis: [], topBangHois: [] };

        // Query to get top 10 users based on level
        const getTopUsersByLevel = `
        SELECT id, username, ngoai_hieu, bang_hoi
        FROM users
        WHERE id > 5
        ORDER BY level DESC
        LIMIT 10;`;

        // Query to get top 10 users based on tai_san
        const getTopUsersByTaiSan = `
        SELECT id, username, ngoai_hieu, bang_hoi
        FROM users
        WHERE id > 5
        ORDER BY tai_san DESC
        LIMIT 10;`;

        const getTopBangHoi = `SELECT name,id FROM clans;`;

        // Execute both queries and process results
        db.query(getTopUsersByLevel, (error, topUsersResults) => {
            if (error) {
                console.error('Error executing topUsers query:', error);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }

            // Modify results to use ngoai_hieu if available, otherwise fallback to username
            dsTop.topUsers = topUsersResults.map(user => ({
                id: user.id,
                user: {
                    username: user.ngoai_hieu || user.username,
                    class: getName(user.bang_hoi || 'danden')
                }
            }));

            // After getting topUsers, execute the next query for topTaiSans
            db.query(getTopUsersByTaiSan, (error, topTaiSansResults) => {
                if (error) {
                    console.error('Error executing topTaiSans query:', error);
                    return res.status(500).json({ message: 'Internal server error', error: error.message });
                }

                // Modify results to use ngoai_hieu if available, otherwise fallback to username
                dsTop.topTaiSans = topTaiSansResults.map(user => ({
                    id: user.id,
                    user: {
                        username: user.ngoai_hieu || user.username,
                        class: getName(user.bang_hoi || 'danden')
                    }
                }));
                db.query(getTopBangHoi, (error, topBangHoiResults) => {
                    if (error) {
                        console.error('Error executing topTaiSans query:', error);
                        return res.status(500).json({ message: 'Internal server error', error: error.message });
                    }

                    // Modify results to use ngoai_hieu if available, otherwise fallback to username
                    dsTop.topBangHois = topBangHoiResults.map(user => ({
                        name: user.name,
                        class: getName(user.id)
                    }));
                    // Respond with the dsTop array containing both sets of top users
                    return res.status(200).json(dsTop);
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

function getName(name) {
    const id = {
        1: 'thienmon',
        2: 'vinhhang',
        9: 'voquan'
    };

    if (id.hasOwnProperty(name)) {
        return id[name];
    }

    return name;
}
