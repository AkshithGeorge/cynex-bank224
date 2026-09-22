-- ====================================================================
-- CYNEX BANK - ONLINE BANKING & PAYMENT GATEWAY DATABASE SCHEMA
-- Compatible with MySQL (8.0+) and PostgreSQL (12+)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. MYSQL SCHEMA DEFINITION
-- --------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS cynexbank_db;
USE cynexbank_db;

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method_type VARCHAR(30) NOT NULL,
    details VARCHAR(255) DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tx_username (username),
    INDEX idx_tx_status (status),
    CONSTRAINT fk_tx_accounts FOREIGN KEY (username) REFERENCES accounts(username) ON DELETE CASCADE
);

-- Predefined Demo Accounts from Main.java
INSERT IGNORE INTO accounts (username, password, balance) VALUES
('akshith', 'Akshith@123', 10000.00),
('allen', 'Allen@123', 10000.00),
('ishitha', 'Ishitha@123', 10000.00),
('pooja', 'Pooja@123', 10000.00),
('shivapriya', 'Shivapriya@123', 10000.00);

-- --------------------------------------------------------------------
-- 2. POSTGRESQL EQUIVALENT SYNTAX (If using PostgreSQL)
-- --------------------------------------------------------------------
/*
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL REFERENCES accounts(username) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    method_type VARCHAR(30) NOT NULL,
    details VARCHAR(255) DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tx_username ON transactions(username);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
*/
