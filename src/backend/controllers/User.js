const connection = require('../db/connect')
const Base = require('./Base')
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PRIVATE_KEY_FILE } = require('../keyGen');
const privateKey = fs.readFileSync(PRIVATE_KEY_FILE, 'utf-8');
require('dotenv').config()
const nodemailer = require('nodemailer');
const secretKey = process.env.JWT_SECRET;
const uploadBase64Image = require('../db/imageUploadConfig')
const paypal = require('../api/payment/paypal')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.ADMIN_GMAIL,
        pass: process.env.GMAIL_PASS
    }
});


class User extends Base {
    constructor(
        id,
        username,
        password,
        email,
        info,
        profile_picture,
        created_at,
        email_is_verified,
        available
    ) {
        super(id);
        this.username = username;
        this.password = password;
        this.email = email;
        this.info = info;
        this.profile_picture = profile_picture;
        this.created_at = created_at;
        this.email_is_verified = email_is_verified;
        this.available = available;
    }

    getById(req, res) {
        const { id } = req.query;
        connection.query(`SELECT * FROM user WHERE id = ?`, [id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: err.message });
            } else if (result.length === 0) {
                res.status(404).json({ message: `User with id ${id} not found` });
            } else {
                res.json({ data: result[0] });
            }
        });
    }

    signup(req, res) {
        const user = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        };
        console.log(user);

        connection.query(`SELECT * FROM \`user\` WHERE username = '${user.username}'`, (err, result) => {
            if (err) {
                console.log(err);
                console.log("From select username");
                res.status(500).send({ message: err.message });
            } else if (result.length !== 0) {
                console.log("This user already exists!");
                res.status(409).send({ message: "Username existed!" });
            } else {
                try {
                    const bufferPassword = Buffer.from(user.password, 'base64');
                    const decryptedPassword = crypto.privateDecrypt({
                        key: privateKey,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: 'sha256',
                    }, bufferPassword).toString('utf8');
                    console.log("Decrypted Password: ", decryptedPassword);

                    const hashedPassword = crypto.createHash('sha256').update(decryptedPassword).digest('hex');
                    console.log("Hashed Password: ", hashedPassword);

                    connection.query('SELECT MAX(id) AS maxId FROM \`user\`', (err1, result1) => {
                        if (err1) {
                            console.log(err1);
                            console.log("Error fetching max ID");
                            res.status(500).send({ message: err1.message });
                        } else {
                            const newUserId = result1[0] ? result1[0].maxId + 1 : 1;

                            connection.query(`INSERT INTO \`user\` (id, username, password, email, email_is_verified, available) VALUES (?, ?, ?, ?, 0, 1)`, [newUserId, user.username, hashedPassword, user.email], (err2) => {
                                if (err2) {
                                    console.log(err2);
                                    console.log("From insert user");
                                    res.status(500).send({ message: err2.message });
                                } else {
                                    console.log("Success");
                                    res.status(200).send({ message: "OK" });
                                }
                            });
                        }
                    });
                } catch (err) {
                    console.log(err);
                    res.status(500).send({ message: "Error decrypting password" });
                }
            }
        });
    }

    login(req, res) {
        const user = {
            username: req.body.username,
            password: req.body.password
        }

        connection.query(`select * from user where username = '${user.username}'`, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err.message });
            }
            else if (result.length == 0) {
                console.log("User doesn't exist!");
                res.status(404).send({ message: "There's no user with username: " + user.username });
            }
            else {
                try {
                    const bufferPassword = Buffer.from(user.password, 'base64');
                    const decryptedPassword = crypto.privateDecrypt({
                        key: privateKey,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: 'sha256',
                    }, bufferPassword).toString('utf8');
                    console.log("Decrypted Password: ", decryptedPassword);

                    const hashedPassword = crypto.createHash('sha256').update(decryptedPassword).digest('hex');
                    console.log("Hashed Password: ", hashedPassword);
                    if (hashedPassword === result[0].password) {
                        console.log(result[0]);
                        res.json({ data: result[0], token: jwt.sign({ userId: result[0].id }, secretKey) });
                    }
                    else {
                        console.log("Wrong password");
                        res.status(401).json({ message: "Wrong password!" });
                    }

                } catch (err) {
                    console.log(err);
                    res.status(500).send({ message: "Error decrypting password" });
                }
            }
        })
    }

    verifyEmail(req, res) {
        const { email, id } = req.body;

        if (!email || !id) {
            return res.status(400).json({ message: "Email and ID are required" });
        }

        const verificationUrl = `http://localhost:2811/user/verify?id=${id}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Verify Your Email',
            html: `
                <h2>Email Verification For Movie Website</h2>
                <p>Click the button below to verify your email:</p>
                <a href="${verificationUrl}" style="padding: 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending email', error: error.message });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Verification email sent successfully' });
        });
    }

    verify(req, res) {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: "Missing user ID" });
        }

        connection.query(`UPDATE \`user\` SET email_is_verified = 1 WHERE id = ?`, [id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: err.message });
            }
            else {
                console.log(`User with ID ${id} has verified their email`);
                res.status(200).send(`Email verification successful for user ID: ${id}`);
            }
        })
    }

    async updateProfilePicture(req, res) {
        const userId = req.body.userId;
        let url = "";
        try {
            url = await uploadBase64Image(req.file.buffer.toString('base64'));

            connection.query(
                `UPDATE \`user\` SET profile_picture = ? WHERE id = ?`,
                [url, userId],
                (err, result) => {
                    if (err) {
                        console.error("Error updating profile picture:", err);
                        return res.status(500).json({ message: 'Error updating profile picture' });
                    }
                    res.status(200).json({ message: 'Profile picture updated successfully', url });
                }
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ message: 'Error uploading image!' });
        }
    }

    updateInfo(req, res) {
        const { id, info } = req.body;
        connection.query(`update \`user\` set info = ? where id = ?`, [info, id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: err.message });
            } else {
                res.send();
            }
        })
    }

    updateEmail(req, res) {
        const { id, email } = req.body;

        if (!id || !email) {
            return res.status(400).json({ message: 'User ID and email are required.' });
        }

        const query = `UPDATE \`user\` SET email = ?, email_is_verified = 0 WHERE id = ?`;

        connection.query(query, [email, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (result.affectedRows === 0) {
                console.log(result);
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'Email updated successfully and verification reset.' });
        });
    }

    async pay(req, res) {
        try {
            const url = await paypal.createOrder();
            console.log("Redirecting to:", url);
            res.redirect(url);
        } catch (e) {
            console.error('Error creating PayPal order:', e);
            res.status(500).send('Error creating payment order.');
        }
    }

    async paymentSuccess(req, res) {
        try {
            const { token } = req.query;
            await paypal.captureOrder(token);
            res.redirect('http://localhost:3000/billings/success');
        } catch (error) {
            console.error('Error capturing payment:', error);
            res.redirect('http://localhost:3000/billings/fail');
        }
    }

    paymentCancel(req, res) {
        res.redirect('http://localhost:3000/billings');
    }

    getAllUsers(req, res) {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 100;
        const offset = (page - 1) * limit;

        connection.query(
            `SELECT * FROM user ORDER BY id ASC LIMIT ? OFFSET ?`,
            [limit, offset],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                connection.query(`SELECT COUNT(*) AS total FROM user`, (err, countResult) => {
                    if (err) {
                        return res.status(500).json({ error: "Internal Server Error" });
                    }

                    const totalUsers = countResult[0].total;
                    const totalPages = Math.ceil(totalUsers / limit);

                    res.json({
                        data: result,
                        meta: {
                            currentPage: page,
                            totalPages,
                            totalUsers,
                            perPage: limit,
                        },
                    });
                });
            }
        );
    }

    changePassword(req, res) {
        const { id, newPassword } = req.body;

        if (!id || !newPassword) {
            return res.status(400).json({ message: "ID and new password are required." });
        }

        try {
            const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

            connection.query(
                'UPDATE user SET password = ? WHERE id = ?',
                [hashedPassword, id],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Database error occurred." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ message: "User not found." });
                    }
                    res.status(200).json({ message: "Password reset successfully." });
                }
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error occurred." });
        }
    }

    async sendAdminEmail(req, res) {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ error: "Email and message are required" });
        }

        const mailOptions = {
            from: 'erinelinguester@gmail.com',
            to: email,
            subject: 'Email from Smothvie Admin',
            text: message,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    }

    deleteUser(req, res) {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const query = 'DELETE FROM user WHERE id = ?';

        connection.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error deleting user:', err);
                return res.status(500).json({ error: 'Failed to delete user' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        });
    }
}

module.exports = User