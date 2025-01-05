const connection = require('../db/connect')
const Base = require('./Base')

class Comment extends Base {
    constructor(
        commentid,
        userid,
        movieid,
        comment,
        hidden,
        postdate,
        reasons
    ) {
        super(commentid);
        this.userid = userid;
        this.movieid = movieid;
        this.comment = comment;
        this.hidden = hidden;
        this.postdate = postdate;
        this.reasons = reasons;
    }

    getMovieComments(req, res) {
        const id = req.query.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                c.commentid, c.movieid, c.comment, c.postdate, c.hidden, c.userid,
                GROUP_CONCAT(hc.reason SEPARATOR ',') AS reasons, 
                u.username, u.email, u.created_at, u.available, u.profile_picture
            FROM 
                \`comment\` c
            LEFT JOIN 
                hidden_comment hc ON c.commentid = hc.commentid
            INNER JOIN 
                \`user\` u ON c.userid = u.id
            WHERE 
                c.movieid = ?
            GROUP BY 
                c.commentid, c.movieid, c.comment, c.postdate, c.hidden, c.userid,
                u.username, u.email, u.created_at, u.available, u.profile_picture
            ORDER BY
                c.postdate DESC
            LIMIT ? OFFSET ?;
        `;

        connection.query(query, [id, limit, offset], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: "Error executing query", error: err });
            } else {
                const data = result.map((comment) => {
                    return {
                        ...comment,
                        reasons: comment.reasons ? comment.reasons.split(',') : []
                    };
                });

                const countQuery = `
                    SELECT COUNT(*) AS total 
                    FROM \`comment\` 
                    WHERE movieid = ?;
                `;

                connection.query(countQuery, [id], (countErr, countResult) => {
                    if (countErr) {
                        console.error(countErr);
                        res.status(500).json({ status: 500, message: "Error fetching total count", error: countErr });
                    } else {
                        const total = countResult[0].total;
                        const totalPages = Math.ceil(total / limit);

                        res.json({
                            status: 200,
                            data,
                            pagination: {
                                total,
                                totalPages,
                                currentPage: page,
                                limit,
                            },
                        });
                    }
                });
            }
        });
    }

    postComment(req, res) {
        const { userId, movieId, comment } = req.body;

        connection.query(`INSERT INTO \`comment\`(userid,movieid,comment,hidden) VALUES(?,?,?,0)`, [userId, movieId, comment], (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            } else {
                res.json({ status: 200, data: result });
            }
        })
    }

    hideComment(req, res) {
        const { commentId, reasons } = req.body;

        const values = reasons.map((reason) => {
            return [commentId, reason];
        })

        connection.query(`UPDATE \`comment\` SET hidden = 1 WHERE commentid = ?`, [commentId], (updateErr) => {
            if (updateErr) {
                res.status(500).json({ status: 500, message: updateErr.message });
            }
            else {
                connection.query(`INSERT INTO hidden_comment(commentid,reason) VALUES(?,?)`, [reasons], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.json({ status: 500, message: err });
                    } else {
                        res.json({ status: 200, data: result });
                    }
                })
            }
        })
    }

    reportComment(req, res) {
        const { commentId, reasons, reporterId } = req.body;

        if (!Array.isArray(reasons) || !commentId || !reporterId || reasons.length === 0) {
            return res.status(400).json({ status: 400, message: "Invalid input data" });
        }

        const values = reasons.map((reason) => [commentId, reason, reporterId]);

        const query = `INSERT INTO reported_comment (commentid, reason, reporterid) VALUES ? ON DUPLICATE KEY UPDATE reason = VALUES(reason)`;

        connection.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 500, message: "Server Error", error: err });
            } else {
                return res.status(200).json({ status: 200, message: "Reports submitted successfully", data: result });
            }
        });
    }

    deleteComment(req, res) {
        const { commentid } = req.body;

        connection.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ status: 500, message: "Server Error: Unable to start transaction" });
            }

            connection.query(`DELETE FROM hidden_comment WHERE commentid = ?`, [commentid], (hcErr) => {
                if (hcErr) {
                    return connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Server Error: Deleting from hidden_comment" });
                    });
                }

                connection.query(`DELETE FROM comment WHERE commentid = ?`, [commentid], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ status: 500, message: "Server Error: Deleting from comment" });
                        });
                    }

                    connection.commit((commitErr) => {
                        if (commitErr) {
                            return connection.rollback(() => {
                                res.status(500).json({ status: 500, message: "Server Error: Committing transaction" });
                            });
                        }
                        res.status(200).send();
                    });
                });
            });
        });
    }

    async getAllComments(req, res) {
        try {
            const commentQuery = `
                SELECT 
                    c.commentid, 
                    c.userid, 
                    c.movieid, 
                    c.comment, 
                    c.hidden, 
                    c.postdate, 
                    u.username, 
                    u.profile_picture
                FROM 
                    comment c
                INNER JOIN 
                    user u ON c.userid = u.id
                ORDER BY 
                    c.postdate DESC;
            `;

            const hiddenReasonQuery = `
                SELECT 
                    hc.commentid, 
                    hc.reason
                FROM 
                    hidden_comment hc;
            `;

            const queryAsync = (sql) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(results);
                    });
                });
            };

            const comments = await queryAsync(commentQuery);
            const hiddenReasons = await queryAsync(hiddenReasonQuery);

            const hiddenReasonMap = hiddenReasons.reduce((map, hr) => {
                if (!map[hr.commentid]) {
                    map[hr.commentid] = [];
                }
                map[hr.commentid].push(hr.reason);
                return map;
            }, {});

            const results = comments.map((comment) => ({
                ...comment,
                hidden_reasons: hiddenReasonMap[comment.commentid] || [],
            }));

            res.status(200).json({
                data: results,
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({
                message: 'Failed to fetch comments.',
            });
        }
    }

    async getAllReportedComments(req, res) {
        try {
            const queryAsync = (sql) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(results);
                    });
                });
            };

            const query = `
                SELECT c.*, u.username, u.profile_picture
                FROM comment c 
                INNER JOIN user u ON u.id = c.userid
                WHERE c.commentid IN (SELECT DISTINCT commentid FROM reported_comment)
            `;

            const reasonQuery = `
                SELECT * 
                FROM reported_comment
            `;

            const reportedComments = await queryAsync(query);
            const reasons = await queryAsync(reasonQuery);

            const reasonsMap = reasons.reduce((map, reason) => {
                if (!map[reason.commentid]) {
                    map[reason.commentid] = [];
                }
                map[reason.commentid].push(reason.reason);
                return map;
            }, {});

            const mergedComments = reportedComments.map((comment) => ({
                ...comment,
                reasons: reasonsMap[comment.commentid] || [],
            }));

            res.json({
                success: true,
                data: mergedComments,
            });
        } catch (error) {
            console.error('Error fetching reported comments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch reported comments.',
            });
        }
    }

    async deleteMultipleComments(req, res) {
        try {
            const { commentids } = req.body;

            if (!Array.isArray(commentids) || commentids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or empty commentids array.',
                });
            }

            const placeholders = commentids.map(() => '?').join(', ');
            const query = `DELETE FROM comment WHERE commentid IN (${placeholders})`;

            const result = await new Promise((resolve, reject) => {
                connection.query(query, commentids, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            res.status(200).json({
                success: true,
                message: `${result.affectedRows} comment(s) deleted successfully.`,
            });
        } catch (error) {
            console.error('Error deleting comments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete comments.',
            });
        }
    }

    async hideMultipleComments(req, res) {
        try {
            const comments = req.body;

            if (!Array.isArray(comments) || comments.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or empty comments array.',
                });
            }

            const updateCommentQuery = `UPDATE comment SET hidden = 1 WHERE commentid = ?`;
            const insertReasonQuery = `INSERT INTO hidden_comment (commentid, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = VALUES(reason)`;

            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            for (const { commentid, reasons } of comments) {
                if (!commentid || !Array.isArray(reasons) || reasons.length === 0) {
                    throw new Error(`Invalid commentid or reasons for commentid: ${commentid}`);
                }

                await new Promise((resolve, reject) => {
                    connection.query(updateCommentQuery, [commentid], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                for (const reason of reasons) {
                    await new Promise((resolve, reject) => {
                        connection.query(insertReasonQuery, [commentid, reason], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                }
            }

            await new Promise((resolve, reject) => {
                connection.commit(err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            res.status(200).json({
                success: true,
                message: `${comments.length} comment(s) updated and reasons added successfully.`,
            });
        } catch (error) {
            await new Promise((resolve, reject) => {
                connection.rollback(() => resolve());
            });

            console.error('Error hiding comments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to hide comments and insert reasons.',
            });
        }
    }

    async confirmDeleteReportedComments(req, res) {
        const { commentids } = req.body;

        if (!Array.isArray(commentids) || commentids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing comment IDs.",
            });
        }

        const query = `
            DELETE FROM reported_comment
            WHERE commentid IN (?)
        `;

        try {
            const [result] = await connection.promise().query(query, [commentids]);
            res.status(200).json({
                success: true,
                message: `${result.affectedRows} reported comments were successfully dismissed.`,
            });
        } catch (error) {
            console.error("Error rejecting reported comments:", error);
            res.status(500).json({
                success: false,
                message: "Failed to reject reported comments.",
            });
        }
    }
}

module.exports = Comment