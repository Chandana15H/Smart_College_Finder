
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const savedCollegeRoutes = require("./routes/savedCollegeRoutes");

const studentRoutes = require("./routes/studentRoutes");


// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes(pool));
app.use("/api/auth", authRoutes);
app.use("/api/saved-colleges", savedCollegeRoutes);

app.use("/api/students", studentRoutes);

// Get all states from MySQL

/* Add a new college */
app.post('/api/colleges', authMiddleware, async (req, res) => {
    try {
        const {
            college_name,
            area_id,
            address,
            phone,
            website,
            description,
            image_url,
            rating
        } = req.body;

        // Validate required fields

        // Validate required college name
        if (
            typeof college_name !== "string" ||
            !college_name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "College name is required."
            });
        }

        // Area is optional when the exact locality is unknown
        let parsedAreaId = null;

        if (area_id !== undefined && area_id !== null && area_id !== "") {
            parsedAreaId = Number(area_id);

            if (!Number.isInteger(parsedAreaId) || parsedAreaId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a valid area."
                });
            }

            // Check whether the selected area exists
            const [areas] = await pool.execute(
                "SELECT area_id FROM areas WHERE area_id = ?",
                [parsedAreaId]
            );

            if (areas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "The selected area does not exist."
                });
            }
        }


        // Validate the optional rating
        let parsedRating = null;

        if (rating !== undefined && rating !== null && rating !== "") {
            parsedRating = Number(rating);

            if (
                !Number.isFinite(parsedRating) ||
                parsedRating < 0 ||
                parsedRating > 5 ||
                Math.round(parsedRating * 10) !== parsedRating * 10
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 0 and 5, with at most one decimal place."
                });
            }
        }

        const sql = `
            INSERT INTO colleges
            (
                college_name,
                area_id,
                address,
                phone,
                website,
                description,
                image_url,
                rating
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            college_name.trim(),
            parsedAreaId,
            address || null,
            phone || null,
            website || null,
            description || null,
            image_url || null,
            parsedRating
        ]);

        res.status(201).json({
            success: true,
            message: "College added successfully.",
            college_id: result.insertId
        });

    } catch (error) {
        console.error("Add college error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to add college."
        });
    }
});

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


/* Update an existing district */
app.put("/api/districts/:id", authMiddleware, async (req, res) => {
    try {
        const districtId = Number(req.params.id);
        const { district_name } = req.body;

        const name =
            typeof district_name === "string"
                ? district_name.trim()
                : "";

        if (!Number.isInteger(districtId) || districtId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid district ID."
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "District name is required."
            });
        }

        const [existing] = await pool.query(
            `SELECT district_id
             FROM districts
             WHERE LOWER(district_name) = LOWER(?)
               AND district_id != ?`,
            [name, districtId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This district name already exists."
            });
        }

        const [result] = await pool.query(
            `UPDATE districts
             SET district_name = ?
             WHERE district_id = ?`,
            [name, districtId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "District not found."
            });
        }

        return res.json({
            success: true,
            message: "District updated successfully."
        });

    } catch (error) {
        console.error("Error updating district:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update district."
        });
    }
});


/* Delete a district if no cities are linked to it */
app.delete("/api/districts/:id", authMiddleware, async (req, res) => {
    try {
        const districtId = Number(req.params.id);

        if (!Number.isInteger(districtId) || districtId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid district ID."
            });
        }

        const [districts] = await pool.query(
            "SELECT district_id FROM districts WHERE district_id = ?",
            [districtId]
        );

        if (districts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "District not found."
            });
        }

        const [cities] = await pool.query(
            "SELECT city_id FROM cities WHERE district_id = ? LIMIT 1",
            [districtId]
        );

        if (cities.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this district because cities are linked to it."
            });
        }

        await pool.query(
            "DELETE FROM districts WHERE district_id = ?",
            [districtId]
        );

        return res.json({
            success: true,
            message: "District deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting district:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete district."
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
/* Add a new district */
app.post("/api/districts", authMiddleware, async (req, res) => {
    try {
        const { district_name } = req.body;

        const name =
            typeof district_name === "string"
                ? district_name.trim()
                : "";

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "District name is required."
            });
        }

        const [existing] = await pool.query(
            `SELECT district_id
             FROM districts
             WHERE LOWER(district_name) = LOWER(?)`,
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This district already exists."
            });
        }

        const [result] = await pool.query(
            "INSERT INTO districts (district_name) VALUES (?)",
            [name]
        );

        return res.status(201).json({
            success: true,
            message: "District added successfully.",
            district: {
                district_id: result.insertId,
                district_name: name
            }
        });

    } catch (error) {
        console.error("Error adding district:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add district."
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


/* Add a new city */
app.post("/api/cities", authMiddleware, async (req, res) => {
    try {
        const { city_name, district_id } = req.body;

        const name =
            typeof city_name === "string" ? city_name.trim() : "";

        const districtId = Number(district_id);

        if (
            !name ||
            !Number.isInteger(districtId) ||
            districtId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid city name and district are required."
            });
        }

        const [districts] = await pool.query(
            "SELECT district_id FROM districts WHERE district_id = ?",
            [districtId]
        );

        if (districts.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected district does not exist."
            });
        }

        const [existing] = await pool.query(
            `SELECT city_id FROM cities
             WHERE LOWER(city_name) = LOWER(?)
             AND district_id = ?`,
            [name, districtId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This city already exists in the selected district."
            });
        }

        const [result] = await pool.query(
            "INSERT INTO cities (city_name, district_id) VALUES (?, ?)",
            [name, districtId]
        );

        return res.status(201).json({
            success: true,
            message: "City added successfully.",
            city: {
                city_id: result.insertId,
                city_name: name,
                district_id: districtId
            }
        });
    } catch (error) {
        console.error("Error adding city:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add city."
        });
    }
});

/* Edit an existing city */
app.put("/api/cities/:id", authMiddleware, async (req, res) => {
    try {
        const cityId = Number(req.params.id);
        const { city_name, district_id } = req.body;

        const name =
            typeof city_name === "string" ? city_name.trim() : "";

        const districtId = Number(district_id);

        if (
            !Number.isInteger(cityId) ||
            cityId <= 0 ||
            !name ||
            !Number.isInteger(districtId) ||
            districtId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid city ID, city name, and district are required."
            });
        }

        const [cities] = await pool.query(
            "SELECT city_id FROM cities WHERE city_id = ?",
            [cityId]
        );

        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "City not found."
            });
        }

        const [districts] = await pool.query(
            "SELECT district_id FROM districts WHERE district_id = ?",
            [districtId]
        );

        if (districts.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected district does not exist."
            });
        }

        const [existing] = await pool.query(
            `SELECT city_id FROM cities
             WHERE LOWER(city_name) = LOWER(?)
             AND district_id = ?
             AND city_id != ?`,
            [name, districtId, cityId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This city already exists in the selected district."
            });
        }

        await pool.query(
            `UPDATE cities
             SET city_name = ?, district_id = ?
             WHERE city_id = ?`,
            [name, districtId, cityId]
        );

        return res.json({
            success: true,
            message: "City updated successfully.",
            city: {
                city_id: cityId,
                city_name: name,
                district_id: districtId
            }
        });
    } catch (error) {
        console.error("Error updating city:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update city."
        });
    }
});
/* Delete a city */
app.delete("/api/cities/:id", authMiddleware, async (req, res) => {
    try {
        const cityId = Number(req.params.id);

        if (!Number.isInteger(cityId) || cityId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid city ID."
            });
        }

        const [cities] = await pool.query(
            "SELECT city_id FROM cities WHERE city_id = ?",
            [cityId]
        );

        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "City not found."
            });
        }

        const [areas] = await pool.query(
            "SELECT area_id FROM areas WHERE city_id = ? LIMIT 1",
            [cityId]
        );

        if (areas.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this city because it has linked areas. Remove or reassign those areas first."
            });
        }

        await pool.query(
            "DELETE FROM cities WHERE city_id = ?",
            [cityId]
        );

        return res.json({
            success: true,
            message: "City deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting city:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete city."
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


/* Add a new area */
app.post("/api/areas", authMiddleware, async (req, res) => {
    try {
        const { area_name, city_id } = req.body;
        const name = typeof area_name === "string" ? area_name.trim() : "";
        const cityId = Number(city_id);

        if (!name || !Number.isInteger(cityId) || cityId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid area name and city are required."
            });
        }

        const [cities] = await pool.query(
            "SELECT city_id FROM cities WHERE city_id = ?",
            [cityId]
        );

        if (cities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected city does not exist."
            });
        }

        const [existing] = await pool.query(
            "SELECT area_id FROM areas WHERE LOWER(area_name) = LOWER(?) AND city_id = ?",
            [name, cityId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This area already exists in the selected city."
            });
        }

        const [result] = await pool.query(
            "INSERT INTO areas (area_name, city_id) VALUES (?, ?)",
            [name, cityId]
        );

        res.status(201).json({
            success: true,
            message: "Area added successfully.",
            area: {
                area_id: result.insertId,
                area_name: name,
                city_id: cityId
            }
        });
    } catch (error) {
        console.error("Error adding area:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add area."
        });
    }
});

// POST /api/areas/bulk
// Create multiple areas while skipping existing duplicates
app.post("/api/areas/bulk", authMiddleware, async (req, res) => {
    const { areas } = req.body;

    if (!Array.isArray(areas) || areas.length === 0) {
        return res.status(400).json({
            message: "Please provide a non-empty areas array."
        });
    }

    if (areas.length > 200) {
        return res.status(400).json({
            message: "Maximum 200 areas per request."
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const created = [];
        const skipped = [];

        for (const item of areas) {
            const areaName = String(item.area_name || "").trim();
            const cityId = Number(item.city_id);

            if (
                !areaName ||
                areaName.length > 100 ||
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {
                throw new Error(
                    "Each area needs a valid area_name and city_id."
                );
            }

            // Confirm the city exists
            const [cities] = await connection.execute(
                "SELECT city_id FROM cities WHERE city_id = ?",
                [cityId]
            );

            if (cities.length === 0) {
                throw new Error(`City ID ${cityId} does not exist.`);
            }

            // Skip duplicate area names within the same city
            const [existing] = await connection.execute(
                `SELECT area_id
                 FROM areas
                 WHERE city_id = ?
                   AND LOWER(area_name) = LOWER(?)
                 LIMIT 1`,
                [cityId, areaName]
            );

            if (existing.length > 0) {
                skipped.push({
                    area_name: areaName,
                    city_id: cityId,
                    reason: "Area already exists"
                });
                continue;
            }

            const [result] = await connection.execute(
                `INSERT INTO areas (area_name, city_id)
                 VALUES (?, ?)`,
                [areaName, cityId]
            );

            created.push({
                area_id: result.insertId,
                area_name: areaName,
                city_id: cityId
            });
        }

        await connection.commit();

        return res.status(201).json({
            message: "Bulk area operation completed.",
            created_count: created.length,
            skipped_count: skipped.length,
            created,
            skipped
        });
    } catch (error) {
        await connection.rollback();

        return res.status(400).json({
            message: error.message || "Failed to create areas."
        });
    } finally {
        connection.release();
    }
});

// PUT /api/colleges/bulk-assign-area
// Assign existing areas to multiple colleges
app.put(
    "/api/colleges/bulk-assign-area",
    authMiddleware,
    async (req, res) => {
        const { assignments } = req.body;

        if (
            !Array.isArray(assignments) ||
            assignments.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide a non-empty assignments array."
            });
        }

        if (assignments.length > 200) {
            return res.status(400).json({
                message: "Maximum 200 assignments per request."
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const updated = [];
            const seenCollegeIds = new Set();

            for (const item of assignments) {
                const collegeId = Number(item.college_id);
                const areaId = Number(item.area_id);

                if (
                    !Number.isInteger(collegeId) ||
                    collegeId <= 0 ||
                    !Number.isInteger(areaId) ||
                    areaId <= 0
                ) {
                    throw new Error(
                        "Each assignment needs valid college_id and area_id values."
                    );
                }

                if (seenCollegeIds.has(collegeId)) {
                    throw new Error(
                        `College ID ${collegeId} appears more than once.`
                    );
                }

                seenCollegeIds.add(collegeId);

                // Confirm the college and area exist in the same city
                const [matches] = await connection.execute(
                    `SELECT
                        c.college_id,
                        c.college_name,
                        c.city_id AS college_city_id,
                        a.area_id,
                        a.area_name,
                        a.city_id AS area_city_id
                     FROM colleges c
                     JOIN areas a ON a.area_id = ?
                     WHERE c.college_id = ?
                     FOR UPDATE`,
                    [areaId, collegeId]
                );

                if (matches.length === 0) {
                    throw new Error(
                        `College ID ${collegeId} or area ID ${areaId} does not exist.`
                    );
                }

                const match = matches[0];

                if (
                    match.college_city_id == null ||
                    Number(match.college_city_id) !==
                    Number(match.area_city_id)
                ) {
                    throw new Error(
                        `Area "${match.area_name}" does not belong to the city of college "${match.college_name}".`
                    );
                }

                await connection.execute(
                    `UPDATE colleges
                     SET area_id = ?
                     WHERE college_id = ?`,
                    [areaId, collegeId]
                );

                updated.push({
                    college_id: collegeId,
                    college_name: match.college_name,
                    area_id: areaId,
                    area_name: match.area_name
                });
            }

            await connection.commit();

            return res.json({
                message: "College areas assigned successfully.",
                updated_count: updated.length,
                updated
            });
        } catch (error) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    error.message ||
                    "Failed to assign areas to colleges."
            });
        } finally {
            connection.release();
        }
    }
);

/* Update an existing area */
app.put("/api/areas/:id", authMiddleware, async (req, res) => {
    try {
        const areaId = Number(req.params.id);
        const { area_name, city_id } = req.body;
        const name = typeof area_name === "string" ? area_name.trim() : "";
        const cityId = Number(city_id);

        if (
            !Number.isInteger(areaId) || areaId <= 0 ||
            !name ||
            !Number.isInteger(cityId) || cityId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid area ID, name, and city are required."
            });
        }

        const [cities] = await pool.query(
            "SELECT city_id FROM cities WHERE city_id = ?",
            [cityId]
        );

        if (cities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected city does not exist."
            });
        }

        const [duplicates] = await pool.query(
            `SELECT area_id FROM areas
             WHERE LOWER(area_name) = LOWER(?)
             AND city_id = ? AND area_id <> ?`,
            [name, cityId, areaId]
        );

        if (duplicates.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This area already exists in the selected city."
            });
        }

        const [result] = await pool.query(
            "UPDATE areas SET area_name = ?, city_id = ? WHERE area_id = ?",
            [name, cityId, areaId]
        );

        if (result.affectedRows === 0) {
            const [existingArea] = await pool.query(
                "SELECT area_id FROM areas WHERE area_id = ?",
                [areaId]
            );

            if (existingArea.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Area not found."
                });
            }
        }

        res.json({
            success: true,
            message: "Area updated successfully."
        });
    } catch (error) {
        console.error("Error updating area:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update area."
        });
    }
});


/* Delete an area */
app.delete("/api/areas/:id", authMiddleware, async (req, res) => {
    try {
        const areaId = Number(req.params.id);

        if (!Number.isInteger(areaId) || areaId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid area ID."
            });
        }

        // Prevent deletion if colleges still use this area
        const [colleges] = await pool.query(
            "SELECT college_id FROM colleges WHERE area_id = ? LIMIT 1",
            [areaId]
        );

        if (colleges.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This area is assigned to a college. Move the college to another area before deleting it."
            });
        }

        const [result] = await pool.query(
            "DELETE FROM areas WHERE area_id = ?",
            [areaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Area not found."
            });
        }

        res.json({
            success: true,
            message: "Area deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting area:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete area."
        });
    }
});



app.put('/api/colleges/:id', authMiddleware, async (req, res) => {
    const collegeId = Number(req.params.id);

    const {
        college_name,
        area_id,
        address,
        phone,
        website,
        description,
        image_url,
        rating
    } = req.body;

    if (!Number.isInteger(collegeId) || collegeId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid college ID."
        });
    }

    if (
        typeof college_name !== "string" ||
        !college_name.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "College name is required."
        });
    }

    const parsedAreaId = Number(area_id);

    if (!Number.isInteger(parsedAreaId) || parsedAreaId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid area."
        });
    }

    let parsedRating = null;

    if (rating !== "" && rating !== null && rating !== undefined) {
        parsedRating = Number(rating);

        if (
            !Number.isFinite(parsedRating) ||
            parsedRating < 0 ||
            parsedRating > 5 ||
            !Number.isInteger(parsedRating * 10)
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 0 and 5, with at most one decimal place."
            });
        }
    }

    try {
        const [areas] = await pool.execute(
            "SELECT area_id FROM areas WHERE area_id = ?",
            [parsedAreaId]
        );

        if (areas.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected area does not exist."
            });
        }

        const [result] = await pool.execute(
            `UPDATE colleges
             SET college_name = ?,
                 area_id = ?,
                 address = ?,
                 phone = ?,
                 website = ?,
                 description = ?,
                 image_url = ?,
                 rating = ?
             WHERE college_id = ?`,
            [
                college_name.trim(),
                parsedAreaId,
                address || null,
                phone || null,
                website || null,
                description || null,
                image_url || null,
                parsedRating,
                collegeId
            ]
        );

        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT college_id FROM colleges WHERE college_id = ?",
                [collegeId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "College not found."
                });
            }
        }

        return res.json({
            success: true,
            message: "College updated successfully."
        });
    } catch (error) {
        console.error("Update college error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update college."
        });
    }
});

/* Delete a college */
app.delete('/api/colleges/:id', authMiddleware, async (req, res) => {
    const collegeId = Number(req.params.id);

    if (!Number.isInteger(collegeId) || collegeId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid college ID."
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check whether the college exists
        const [colleges] = await connection.execute(
            "SELECT college_id FROM colleges WHERE college_id = ?",
            [collegeId]
        );

        if (colleges.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "College not found."
            });
        }

        // Delete related course links first
        await connection.execute(
            "DELETE FROM college_courses WHERE college_id = ?",
            [collegeId]
        );

        // Delete the college
        await connection.execute(
            "DELETE FROM colleges WHERE college_id = ?",
            [collegeId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "College deleted successfully."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Delete college error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to delete college."
        });

    } finally {
        if (connection) {
            connection.release();
        }
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
LEFT JOIN areas a
    ON cl.area_id = a.area_id
LEFT JOIN cities ci
    ON ci.city_id = COALESCE(a.city_id, cl.city_id)
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

app.get("/api/courses", async (req, res) => {
    try {
        const [courses] = await pool.query(
            "SELECT course_id, course_name FROM courses ORDER BY course_name ASC"
        );

        res.json({
            success: true,
            courses: courses
        });
    } catch (error) {
        console.error("Error fetching courses:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses."
        });
    }
});

/* Add a new course */
app.post("/api/courses", authMiddleware, async (req, res) => {
    try {
        const { course_name } = req.body;

        if (!course_name || !course_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course name is required."
            });
        }

        const [result] = await pool.query(
            "INSERT INTO courses (course_name) VALUES (?)",
            [course_name.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Course added successfully.",
            course: {
                course_id: result.insertId,
                course_name: course_name.trim()
            }
        });
    } catch (error) {
        console.error("Error adding course:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This course already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to add course."
        });
    }
});

/* Update an existing course */
app.put("/api/courses/:id", authMiddleware, async (req, res) => {
    try {
        const courseId = Number(req.params.id);
        const { course_name } = req.body;

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        if (!course_name || !course_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course name is required."
            });
        }

        const [result] = await pool.query(
            "UPDATE courses SET course_name = ? WHERE course_id = ?",
            [course_name.trim(), courseId]
        );
        console.log("Course ID received:", courseId);
        console.log("Update result:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        res.json({
            success: true,
            message: "Course updated successfully."
        });
    } catch (error) {
        console.error("Error updating course:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This course name already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update course."
        });
    }
});


/* Delete a course */
app.delete("/api/courses/:id", authMiddleware, async (req, res) => {
    try {
        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        // Check whether this course is used by any college
        const [linkedCourses] = await pool.query(
            "SELECT college_id FROM college_courses WHERE course_id = ? LIMIT 1",
            [courseId]
        );

        if (linkedCourses.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This course is assigned to a college and cannot be deleted yet."
            });
        }

        // Delete the course
        const [result] = await pool.query(
            "DELETE FROM courses WHERE course_id = ?",
            [courseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        res.json({
            success: true,
            message: "Course deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting course:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete course."
        });
    }
});


/* Update an existing course */

// 6. Start the server
const PORT = process.env.PORT || 5000;

console.log("About to start Express server...");


app.listen(PORT, () => {
    console.log(`College-Finder backend running on port ${PORT}`);
});
