#!/usr/bin/env node

/**
 * CLI script to create a table in the database
 * Usage: nusbf
 * then: node create-table.js
 */

const mariadb = require('mariadb');
require('dotenv').config();

// Create database connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

async function createTable() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Check if table already exists
        const tables = await conn.query(`
            SHOW TABLES LIKE 'columns'
        `);
        
        if (tables.length > 0) {
            console.log('Table "columns" already exists.');
            return;
        }
        
        // Create the columns table
        await conn.query(`
            CREATE TABLE columns (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                barcode VARCHAR(255),
                category VARCHAR(255),
                type VARCHAR(255),
                catalog_number VARCHAR(255),
                web_link VARCHAR(255),
                purchase_date DATE,
                cost DECIMAL(10, 2),
                length VARCHAR(50),
                diameter VARCHAR(50),
                volume VARCHAR(50),
                void_volume VARCHAR(50),
                created_by INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_by INT,
                updated_at DATETIME,
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (updated_by) REFERENCES users(id)
            )
        `);
        
        console.log('Successfully created "columns" table.');
    } catch (err) {
        console.error('Error creating columns table:', err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

// Execute the function
createTable();