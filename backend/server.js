
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const adminRoutes = require("./routes/adminRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes(pool));
// Get all states from MySQL
app.get('/api/states', async (req, res) => {
    try {
        const sql = `
            SELECT state_id, state_name
            FROM states
            ORDER BY state_name
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            count: rows.length,
            states: rows
        });
    } catch (error) {
        console.error('States fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve states.'
        });
    }
});

// 1. Test the backend
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'College-Finder backend is running!'
    });
});

// 2. Get all states
app.get('/api/states', async (req, res) => {
    try {
        const sql = `
            SELECT state_id, state_name
            FROM states
            ORDER BY state_name
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            count: rows.length,
            states: rows
        });
    } catch (error) {
        console.error('States fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve states.'
        });
    }
});


// Get all Karnataka districts
app.get('/api/districts', async (req, res) => {
    try {
        const sql = `
            SELECT district_id, district_name
            FROM districts
            ORDER BY district_name
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            count: rows.length,
            districts: rows
        });
    } catch (error) {
        console.error('Districts fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve districts.'
        });
    }
});

// 3. Get cities, including their state information
app.get('/api/cities', async (req, res) => {
    try {
        const sql = `
            SELECT
              ci.city_id,
              ci.city_name,
              ci.district_id,
              s.state_id,
              s.state_name
            FROM cities ci
            LEFT JOIN states s
                ON s.state_id = ci.state_id
            ORDER BY s.state_name, ci.city_name
        `;

        const [rows] = await pool.execute(sql);

        res.json({
            success: true,
            count: rows.length,
            cities: rows
        });
    } catch (error) {
        console.error('Cities fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve cities.'
        });
    }
});

// 4. Get areas, optionally filtered by city ID
app.get('/api/areas', async (req, res) => {
    try {
        const { cityId } = req.query;

        let sql = `
            SELECT
                a.area_id,
                a.area_name,
                a.city_id,
                ci.city_name
            FROM areas a
            JOIN cities ci
                ON ci.city_id = a.city_id
        `;

        const params = [];

        if (cityId) {
            const parsedCityId = Number(cityId);

            if (!Number.isInteger(parsedCityId) || parsedCityId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid city ID.'
                });
            }

            sql += ' WHERE a.city_id = ?';
            params.push(parsedCityId);
        }

        sql += ' ORDER BY a.area_name';

        const [rows] = await pool.execute(sql, params);

        res.json({
            success: true,
            count: rows.length,
            areas: rows
        });
    } catch (error) {
        console.error('Areas fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve areas.'
        });
    }
});

// 5. Search colleges by city, area, and course
app.get('/api/colleges', async (req, res) => {
    try {
        const { district, city, area, course } = req.query;

        let sql = `
            SELECT
                cl.college_id,
                cl.college_name,
                cl.address,
                cl.phone,
                cl.website,
                cl.description,
                cl.image_url,
                cl.rating,
                ci.city_name,
                a.area_name,
                cl.area_id,
                ci.city_id,
                ci.district_id,
                GROUP_CONCAT(
                    DISTINCT co.course_name
                    ORDER BY co.course_name
                    SEPARATOR ', '
                ) AS courses
            FROM colleges cl
            JOIN areas a
                ON cl.area_id = a.area_id
            JOIN cities ci
                ON a.city_id = ci.city_id
            LEFT JOIN college_courses cc
                ON cl.college_id = cc.college_id
            LEFT JOIN courses co
                ON cc.course_id = co.course_id
            WHERE 1 = 1
        `;


        const params = [];

        // Filter by district ID
        if (district) {
            const parsedDistrictId = Number(district);

            if (!Number.isInteger(parsedDistrictId) || parsedDistrictId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid district ID."
                });
            }

            sql += " AND ci.district_id = ?";
            params.push(parsedDistrictId);
        }

        // Filter by city name
        if (city) {
            sql += " AND ci.city_name = ?";
            params.push(city);
        }

        // Filter by area name
        if (area) {
            sql += " AND a.area_name = ?";
            params.push(area);
        }

        // Filter by course name
        if (course) {
            sql += `
        AND EXISTS (
            SELECT 1
            FROM college_courses cc2
            JOIN courses co2
                ON cc2.course_id = co2.course_id
            WHERE cc2.college_id = cl.college_id
              AND co2.course_name = ?
        )
    `;

            params.push(course);
        }


        sql += `
            GROUP BY
                cl.college_id,
                cl.college_name,
                cl.address,
                cl.phone,
                cl.website,
                cl.description,
                cl.image_url,
                cl.rating,
                ci.city_name,
                a.area_name
            ORDER BY cl.college_name
        `;

        const [rows] = await pool.execute(sql, params);

        res.json({
            success: true,
            count: rows.length,
            colleges: rows
        });
    } catch (error) {
        console.error('College search error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve colleges.'
        });
    }
});

// 6. Start the server
const PORT = process.env.PORT || 5000;

console.log("About to start Express server...");
app.listen(PORT, () => {
    console.log(`College-Finder backend running on port ${PORT}`);
});
