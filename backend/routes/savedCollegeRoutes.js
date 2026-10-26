
const express = require("express");
const pool = require("../config/db");
const studentAuthMiddleware = require("../middleware/studentAuthMiddleware");

const router = express.Router();

// Get the logged-in student's saved colleges
router.get("/", studentAuthMiddleware, async (req, res) => {
    try {
        const [colleges] = await pool.execute(
            `SELECT
                sc.saved_id,
                sc.saved_at,
                cl.college_id,
                cl.college_name,
                cl.address,
                cl.phone,
                cl.website,
                cl.description,
                cl.image_url,
                cl.rating,
                a.area_name,
                ci.city_name
             FROM saved_colleges sc
             JOIN colleges cl
                ON cl.college_id = sc.college_id
             LEFT JOIN areas a
                ON a.area_id = cl.area_id
             LEFT JOIN cities ci
                ON ci.city_id = COALESCE(a.city_id, cl.city_id)
             WHERE sc.student_id = ?
             ORDER BY sc.saved_at DESC`,
            [req.student.student_id]
        );

        return res.json({
            success: true,
            count: colleges.length,
            colleges
        });
    } catch (error) {
        console.error("Fetch saved colleges error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve saved colleges."
        });
    }
});

// Save a college for the logged-in student
router.post("/", studentAuthMiddleware, async (req, res) => {
    try {
        const collegeId = Number(req.body.college_id);

        if (!Number.isInteger(collegeId) || collegeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid college ID."
            });
        }

        const [existingCollege] = await pool.execute(
            "SELECT college_id FROM colleges WHERE college_id = ?",
            [collegeId]
        );

        if (existingCollege.length === 0) {
            return res.status(404).json({
                success: false,
                message: "College not found."
            });
        }

        const [result] = await pool.execute(
            `INSERT IGNORE INTO saved_colleges (student_id, college_id)
             VALUES (?, ?)`,
            [req.student.student_id, collegeId]
        );

        if (result.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: "This college is already saved."
            });
        }

        return res.status(201).json({
            success: true,
            message: "College saved successfully."
        });
    } catch (error) {
        console.error("Save college error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to save this college."
        });
    }
});

// Remove a college from the logged-in student's saved list
router.delete("/:collegeId", studentAuthMiddleware, async (req, res) => {
    try {
        const collegeId = Number(req.params.collegeId);

        if (!Number.isInteger(collegeId) || collegeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid college ID."
            });
        }

        const [result] = await pool.execute(
            `DELETE FROM saved_colleges
             WHERE student_id = ? AND college_id = ?`,
            [req.student.student_id, collegeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "This college is not in your saved list."
            });
        }

        return res.json({
            success: true,
            message: "College removed from saved list."
        });
    } catch (error) {
        console.error("Remove saved college error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to remove the saved college."
        });
    }
});

module.exports = router;
