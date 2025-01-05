const connection = require('../db/connect')
const User = require('./User')

class DiamondMember extends User {
    constructor(
        id,
        username,
        password,
        email,
        info,
        profile_picture,
        created_at,
        email_is_verified,
        available,
    ) {
        super(id,
            username,
            password,
            email,
            info,
            profile_picture,
            created_at,
            email_is_verified,
            available)
    }

    currentPlan(req, res) {
        const userId = req.query.userId;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid or missing userId parameter' });
        }

        connection.query(
            'SELECT * FROM payment WHERE userid = ?',
            [userId],
            (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (result.length > 0) {
                    res.status(200).json({ isDiamondMember: true });
                } else {
                    res.status(200).json({ isDiamondMember: false });
                }
            }
        );
    }

    cancelPlan(req, res) {
        const userId = req.query.userId;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid or missing userId parameter' });
        }

        connection.query(`DELETE FROM payment WHERE userid = ?`, [userId], (err, result) => {
            if (err) {
                res.status(500).json({ message: "Server error" });
            } else {
                res.send();
            }
        })
    }

    upgradePlan(req, res) {
        const userId = req.body.userId;

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid or missing userId parameter' });
        }

        const query = `INSERT INTO payment(userid) VALUES(?) 
                       ON DUPLICATE KEY UPDATE userid = VALUES(userid)`;

        connection.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (result.affectedRows > 0) {
                return res.status(200).json({ message: 'Membership updated successfully.' });
            } else {
                return res.status(500).json({ message: 'Unable to update membership.' });
            }
        });
    }
}

module.exports = DiamondMember