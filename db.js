// db.js - Supabase PostgreSQL version
const { Pool } = require("pg");
require('dotenv').config();

// SSL configuration for Supabase
const sslConfig = process.env.DB_SSL === 'true' ? {
    ssl: {
        rejectUnauthorized: false  // Required for Supabase
    }
} : {};

// Create connection pool for Supabase
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,  // Longer timeout for cloud DB
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Supabase PostgreSQL Connection Error:", err.message);
        console.error("Please check your .env configuration");
        return;
    }
    console.log("✅ Connected to Supabase PostgreSQL successfully!");
    release();
});

// Handle pool errors
pool.on('error', (err) => {
    console.error("Unexpected Supabase error:", err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};