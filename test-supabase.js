// test-supabase.js - Test Supabase connection
const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('Testing Supabase PostgreSQL connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Test connection
        const result = await pool.query('SELECT NOW() as server_time, version() as pg_version');
        console.log('\n✅ Connected successfully!');
        console.log(`📅 Server Time: ${result.rows[0].server_time}`);
        console.log(`🐘 PostgreSQL Version: ${result.rows[0].pg_version}`);
        
        // Test tables
        const tables = ['customers', 'loan_types', 'loans', 'payments'];
        for (const table of tables) {
            const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`📊 ${table}: ${count.rows[0].count} records`);
        }
        
        await pool.end();
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Check your .env file has correct values');
        console.log('2. Verify Supabase project is active');
        console.log('3. Check if password contains special characters (may need URL encoding)');
        console.log('4. Ensure your IP is allowed in Supabase settings');
    }
}

testConnection();