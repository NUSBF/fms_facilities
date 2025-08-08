#!/usr/bin/env node

/**
 * CLI script to add a barcode column to the columns table
 * Usage: nusbf
 * then: node add-barcode-column.js
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

async function addBarcodeColumn() {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Check if barcode column already exists
        const columns = await conn.query(`
            SHOW COLUMNS FROM columns LIKE 'barcode'
        `);
        
        if (columns.length > 0) {
            console.log('Column "barcode" already exists in the "columns" table.');
            return;
        }
        
        // Add the barcode column after name column
        await conn.query(`
            ALTER TABLE columns
            ADD COLUMN barcode VARCHAR(255) AFTER name
        `);
        
        console.log('Successfully added "barcode" column to the "columns" table.');
    } catch (err) {
        console.error('Error adding barcode column:', err);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

// Execute the function
addBarcodeColumn();