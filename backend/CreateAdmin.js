
require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function createAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;

        if (!username || !password) {
            throw new Error(
                "Please set ADMIN_USERNAME and ADMIN_PASSWORD in .env first."
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
            [username, passwordHash]
        );

        console.log("Admin account created successfully!");
        console.log("Username:", username);
    } catch (error) {
        console.error("Could not create admin:", error.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
