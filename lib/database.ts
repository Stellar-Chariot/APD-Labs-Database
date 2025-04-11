"use server"

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

// Database configuration
const dbConfig = {
  uri: process.env.DATABASE_URL,
  // Additional configuration options
  connectionLimit: 10,
  waitForConnections: true,
}

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig)

// Function to check if the database is initialized
async function isDatabaseInitialized() {
  try {
    console.log('Checking if database is initialized...')
    // Check if the samples table exists
    const [rows] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'samples'
    `)
    
    // @ts-ignore - we know the result has a length property
    const isInitialized = rows.length > 0
    console.log(`Database initialized: ${isInitialized}`)
    return isInitialized
  } catch (error) {
    console.error('Error checking database state:', error)
    return false
  }
}

// Function to initialize the database
async function initializeDatabase() {
  try {
    console.log('Auto-initializing database schema...')
    
    // Read the schema SQL
    const schemaSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'mysql-schema.sql'),
      'utf8'
    )
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .filter(statement => !statement.toUpperCase().includes('DROP TABLE'))
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.slice(0, 30)}...`)
      await pool.query(statement)
    }
    
    console.log('Database schema auto-initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

// Get a connection from the pool with auto-initialization
export async function getConnection() {
  // Check if the database is initialized
  const initialized = await isDatabaseInitialized()
  
  // Initialize if needed
  if (!initialized) {
    console.log('Database not initialized, running auto-initialization')
    await initializeDatabase()
  } else {
    console.log('Database already initialized')
  }
  
  return pool
}

// Export a function that returns the pool instead of exporting the pool directly
export async function getPool() {
  return pool
} 