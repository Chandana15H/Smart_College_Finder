
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
    const router = express.Router();

    router.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Username and password are required."
                });
            }

            const [admins] = await pool.execute(
                "SELECT admin_id, username, password_hash FROM admin_users WHERE username = ?",
                [username]
            );

            if (admins.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password."
                });
            }

            const admin = admins[0];
            const passwordMatches = await bcrypt.compare(
                password,
                admin.password_hash
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password."
                });
            }

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({
                    success: false,
                    message: "Authentication is not configured."
                });
            }

            const token = jwt.sign(
                { adminId: admin.admin_id, username: admin.username },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return res.json({
                success: true,
                message: "Login successful.",
                token,
                admin: {
                    adminId: admin.admin_id,
                    username: admin.username
                }
            });
        } catch (error) {
            console.error("Admin login error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to process login."
            });
        }
    });

    return router;
};
