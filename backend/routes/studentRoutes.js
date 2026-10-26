
const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const studentAuthMiddleware = require("../middleware/studentAuthMiddleware");

// Get the logged-in student's profile
router.get("/profile", studentAuthMiddleware, async (req, res) => {
    try {
        const studentId = req.student.student_id;

        const [rows] = await pool.query(
            "SELECT student_id, full_name, email, created_at FROM students WHERE student_id = ?",
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found.",
            });
        }

        res.json({
            success: true,
            student: rows[0],
        });
    } catch (error) {
        console.error("Get student profile error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load student profile.",
        });
    }
});

// Update the logged-in student's name
router.put("/profile", studentAuthMiddleware, async (req, res) => {
    try {
        const studentId = req.student.student_id;
        const { full_name } = req.body;

        if (
            typeof full_name !== "string" ||
            !full_name.trim() ||
            full_name.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a name between 1 and 100 characters.",
            });
        }

        const [result] = await pool.query(
            "UPDATE students SET full_name = ? WHERE student_id = ?",
            [full_name.trim(), studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found.",
            });
        }

        const [rows] = await pool.query(
            "SELECT student_id, full_name, email, created_at FROM students WHERE student_id = ?",
            [studentId]
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            student: rows[0],
        });
    } catch (error) {
        console.error("Update student profile error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update student profile.",
        });
    }
});

module.exports = router;
