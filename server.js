// server.js - PostgreSQL version
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");  // Now returns { query, pool }
require('dotenv').config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:8080', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// REGISTER - PostgreSQL syntax
app.post("/register", async (req, res) => {
    console.log("Registration request received:", req.body);
    
    const { name, email, phone, username, password } = req.body;
    
    if (!name || !email || !phone || !username || !password) {
        return res.status(400).send({ message: "All fields are required" });
    }
    
    // PostgreSQL uses $1, $2, etc. instead of ?
    const sql = "INSERT INTO customers(name, email, phone, username, password) VALUES($1, $2, $3, $4, $5) RETURNING id";
    
    try {
        const result = await db.query(sql, [name, email, phone, username, password]);
        console.log("Registration successful for:", username);
        res.send({ message: "Registration Successful", id: result.rows[0].id });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send({ message: "Registration failed: " + err.message });
    }
});

// LOGIN
app.post("/user-login", async (req, res) => {
    console.log("User login request:", req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }
    
    const sql = "SELECT * FROM customers WHERE username = $1";
    
    try {
        const result = await db.query(sql, [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const user = result.rows[0];
        
        if (user.password === password) {
            const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
            const userResponse = {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                token: token
            };
            res.json(userResponse);
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// APPLY LOAN - PostgreSQL uses CURRENT_TIMESTAMP
app.post("/apply-loan", async (req, res) => {
    console.log("Loan application received:", req.body);
    
    const { customer_id, loan_type, amount, duration } = req.body;
    
    if (!customer_id || !loan_type || !amount || !duration) {
        return res.status(400).send({ message: "All fields are required" });
    }
    
    // PostgreSQL uses $ placeholders and CURRENT_TIMESTAMP (same as MySQL NOW())
    const sql = "INSERT INTO loans(customer_id, loan_type, amount, duration, status, created_at) VALUES($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP) RETURNING id";
    
    try {
        const result = await db.query(sql, [customer_id, loan_type, amount, duration]);
        console.log("Loan application successful for customer:", customer_id);
        res.send({ message: "Loan Application Submitted", id: result.rows[0].id });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send({ message: "Loan application failed: " + err.message });
    }
});

// VIEW LOANS
app.get("/loans/:id", async (req, res) => {
    console.log("View loans request for customer:", req.params.id);
    
    const sql = "SELECT * FROM loans WHERE customer_id = $1 ORDER BY id DESC";
    
    try {
        const result = await db.query(sql, [req.params.id]);
        res.send(result.rows);  // PostgreSQL returns rows array
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send([]);
    }
});

// TEST endpoint
app.get("/test", (req, res) => {
    res.send({ status: "LMS Backend is running with PostgreSQL" });
});

app.listen(8080, () => {
    console.log("========================================");
    console.log("✅ LMS Backend running on port 8080");
    console.log("✅ Using PostgreSQL database");
    console.log("========================================");
});