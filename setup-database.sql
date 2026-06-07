-- eLoan System - Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to create all required tables

CREATE TABLE IF NOT EXISTS customers (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL UNIQUE,
    phone     VARCHAR(20)  NOT NULL,
    username  VARCHAR(50)  NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_types (
    id            SERIAL PRIMARY KEY,
    loan_name     VARCHAR(100) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER      NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_type   VARCHAR(100) NOT NULL,
    amount      DECIMAL(15,2) NOT NULL,
    duration    INTEGER       NOT NULL,  -- in months
    status      VARCHAR(20)   NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id           SERIAL PRIMARY KEY,
    loan_id      INTEGER       NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount       DECIMAL(15,2) NOT NULL,
    payment_date DATE          DEFAULT CURRENT_DATE
);

-- Seed default loan types
INSERT INTO loan_types (loan_name, interest_rate) VALUES
    ('Personal Loan',   12.5),
    ('Home Loan',        8.0),
    ('Car Loan',        10.0),
    ('Business Loan',   15.0),
    ('Education Loan',   7.5)
ON CONFLICT DO NOTHING;
