
const jwt = require("jsonwebtoken");

function studentAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Student login required."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            decoded.role !== "student" ||
            !Number.isInteger(decoded.student_id) ||
            decoded.student_id <= 0
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid student token."
            });
        }

        req.student = {
            student_id: decoded.student_id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Student login session expired or is invalid. Please log in again."
        });
    }
}

module.exports = studentAuthMiddleware;
