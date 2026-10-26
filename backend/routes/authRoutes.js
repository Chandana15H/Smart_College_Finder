
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// Student registration
router.post("/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required."
            });
        }

        const cleanName = full_name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || cleanName.length > 100) {
            return res.status(400).json({
                message: "Please enter a valid name (maximum 100 characters)."
            });
        }

        if (cleanEmail.length > 150) {
            return res.status(400).json({
                message: "Email is too long."
            });
        }

        if (typeof password !== "string" || password.length < 8 || password.length > 72) {
            return res.status(400).json({
                message: "Password must be between 8 and 72 characters."
            });
        }

        const [existing] = await pool.execute(
            "SELECT student_id FROM students WHERE email = ?",
            [cleanEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            "INSERT INTO students (full_name, email, password_hash) VALUES (?, ?, ?)",
            [cleanName, cleanEmail, passwordHash]
        );

        return res.status(201).json({
            message: "Registration successful. You can now log in."
        });
    } catch (error) {
        console.error("Student registration error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        return res.status(500).json({
            message: "Unable to register right now. Please try again."
        });
    }
});

// Student login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [students] = await pool.execute(
            "SELECT student_id, full_name, email, password_hash FROM students WHERE email = ?",
            [cleanEmail]
        );

        if (
            students.length === 0 ||
            !(await bcrypt.compare(password, students[0].password_hash))
        ) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from the backend environment.");
            return res.status(500).json({
                message: "Login is not configured. Please contact the administrator."
            });
        }

        const student = students[0];

        const token = jwt.sign(
            {
                student_id: student.student_id,
                role: "student"
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            message: "Login successful.",
            token,
            student: {
                student_id: student.student_id,
                full_name: student.full_name,
                email: student.email
            }
        });
    } catch (error) {
        console.error("Student login error:", error.message);

        return res.status(500).json({
            message: "Unable to log in right now. Please try again."
        });
    }
});

module.exports = router;
