// migrate-to-supabase.js - Migrate local MySQL to Supabase
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

async function migrateToSupabase() {
    console.log('🚀 Starting migration from Local MySQL to Supabase PostgreSQL...');
    
    // Local MySQL config (set these in .env)
    const mysqlConfig = {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE || 'eloan_db'
    };
    
    // Supabase PostgreSQL config
    const pgConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    };
    
    let mysqlConn;
    let pgPool;
    
    try {
        // Connect to MySQL
        mysqlConn = await mysql.createConnection(mysqlConfig);
        console.log('✅ Connected to Local MySQL');
        
        // Connect to Supabase
        pgPool = new Pool(pgConfig);
        await pgPool.connect();
        console.log('✅ Connected to Supabase PostgreSQL');
        
        // Test Supabase connection
        const testResult = await pgPool.query('SELECT NOW() as time');
        console.log(`📅 Supabase server time: ${testResult.rows[0].time}`);
        
        // Clear existing data (optional)
        await pgPool.query('TRUNCATE TABLE payments, loans, customers RESTART IDENTITY CASCADE');
        console.log('🔄 Cleared existing data in Supabase');
        
        // Migrate customers
        const [customers] = await mysqlConn.execute('SELECT * FROM customers');
        for (const customer of customers) {
            await pgPool.query(
                `INSERT INTO customers(id, name, email, phone, username, password, created_at) 
                 VALUES($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
                 ON CONFLICT (id) DO NOTHING`,
                [customer.id, customer.name, customer.email, customer.phone, 
                 customer.username, customer.password, customer.created_at]
            );
        }
        console.log(`✅ Migrated ${customers.length} customers`);
        
        // Reset sequence
        await pgPool.query(`SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 1))`);
        
        // Migrate loan_types
        const [loanTypes] = await mysqlConn.execute('SELECT * FROM loan_types');
        for (const lt of loanTypes) {
            await pgPool.query(
                'INSERT INTO loan_types(id, loan_name, interest_rate) VALUES($1, $2, $3) ON CONFLICT (id) DO NOTHING',
                [lt.id, lt.loan_name, lt.interest_rate]
            );
        }
        console.log(`✅ Migrated ${loanTypes.length} loan types`);
        await pgPool.query(`SELECT setval('loan_types_id_seq', COALESCE((SELECT MAX(id) FROM loan_types), 1))`);
        
        // Migrate loans
        const [loans] = await mysqlConn.execute('SELECT * FROM loans');
        for (const loan of loans) {
            await pgPool.query(
                `INSERT INTO loans(id, customer_id, loan_type, amount, duration, status, created_at) 
                 VALUES($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))`,
                [loan.id, loan.customer_id, loan.loan_type, loan.amount, 
                 loan.duration, loan.status || 'pending', loan.created_at]
            );
        }
        console.log(`✅ Migrated ${loans.length} loans`);
        await pgPool.query(`SELECT setval('loans_id_seq', COALESCE((SELECT MAX(id) FROM loans), 1))`);
        
        // Migrate payments
        const [payments] = await mysqlConn.execute('SELECT * FROM payments');
        for (const payment of payments) {
            await pgPool.query(
                `INSERT INTO payments(id, loan_id, amount, payment_date) 
                 VALUES($1, $2, $3, COALESCE($4, CURRENT_DATE))`,
                [payment.id, payment.loan_id, payment.amount, payment.payment_date]
            );
        }
        console.log(`✅ Migrated ${payments.length} payments`);
        await pgPool.query(`SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1))`);
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Customers: ${customers.length}`);
        console.log(`   - Loan Types: ${loanTypes.length}`);
        console.log(`   - Loans: ${loans.length}`);
        console.log(`   - Payments: ${payments.length}`);
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        console.error('Details:', error);
    } finally {
        if (mysqlConn) await mysqlConn.end();
        if (pgPool) await pgPool.end();
    }
}

// Run migration
migrateToSupabase();