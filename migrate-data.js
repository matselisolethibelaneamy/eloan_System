// migrate-data.js - Run this once to transfer data
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

// MySQL connection
const mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Amelya',
    database: 'eloan_db'
};

// PostgreSQL connection
const pgConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Amelya',
    database: 'EloanDB'
};

async function migrate() {
    console.log('Starting migration from MySQL to PostgreSQL...');
    
    let mysqlConn;
    let pgPool;
    
    try {
        // Connect to MySQL
        mysqlConn = await mysql.createConnection(mysqlConfig);
        console.log('✅ Connected to MySQL');
        
        // Connect to PostgreSQL
        pgPool = new Pool(pgConfig);
        console.log('✅ Connected to PostgreSQL');
        
        // Clear PostgreSQL tables (optional - be careful!)
        await pgPool.query('TRUNCATE TABLE payments, loans, customers RESTART IDENTITY CASCADE');
        console.log('Cleared existing PostgreSQL data');
        
        // Migrate customers
        const [customers] = await mysqlConn.execute('SELECT * FROM customers');
        for (const customer of customers) {
            await pgPool.query(
                'INSERT INTO customers(id, name, email, phone, username, password) VALUES($1, $2, $3, $4, $5, $6)',
                [customer.id, customer.name, customer.email, customer.phone, customer.username, customer.password]
            );
        }
        console.log(`✅ Migrated ${customers.length} customers`);
        
        // Reset PostgreSQL sequences
        await pgPool.query("SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers))");
        
        // Migrate loan_types
        const [loanTypes] = await mysqlConn.execute('SELECT * FROM loan_types');
        for (const lt of loanTypes) {
            await pgPool.query(
                'INSERT INTO loan_types(id, loan_name, interest_rate) VALUES($1, $2, $3)',
                [lt.id, lt.loan_name, lt.interest_rate]
            );
        }
        console.log(`✅ Migrated ${loanTypes.length} loan types`);
        await pgPool.query("SELECT setval('loan_types_id_seq', (SELECT MAX(id) FROM loan_types))");
        
        // Migrate loans
        const [loans] = await mysqlConn.execute('SELECT * FROM loans');
        for (const loan of loans) {
            await pgPool.query(
                'INSERT INTO loans(id, customer_id, loan_type, amount, duration, status, created_at) VALUES($1, $2, $3, $4, $5, $6, $7)',
                [loan.id, loan.customer_id, loan.loan_type, loan.amount, loan.duration, loan.status, loan.created_at || new Date()]
            );
        }
        console.log(`✅ Migrated ${loans.length} loans`);
        await pgPool.query("SELECT setval('loans_id_seq', (SELECT MAX(id) FROM loans))");
        
        // Migrate payments
        const [payments] = await mysqlConn.execute('SELECT * FROM payments');
        for (const payment of payments) {
            await pgPool.query(
                'INSERT INTO payments(id, loan_id, amount, payment_date) VALUES($1, $2, $3, $4)',
                [payment.id, payment.loan_id, payment.amount, payment.payment_date]
            );
        }
        console.log(`✅ Migrated ${payments.length} payments`);
        await pgPool.query("SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments))");
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        if (mysqlConn) await mysqlConn.end();
        if (pgPool) await pgPool.end();
    }
}

migrate();