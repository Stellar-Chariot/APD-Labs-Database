require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  // Database configuration
  const dbConfig = {
    uri: process.env.DATABASE_URL,
  };

  console.log('Connecting to database...');
  const pool = mysql.createPool(dbConfig);

  try {
    console.log('Initializing database...');
    
    // First, drop existing tables
    console.log('Dropping existing tables...');
    const dropStatements = [
      'DROP TABLE IF EXISTS data_imports',
      'DROP TABLE IF EXISTS measurement_data',
      'DROP TABLE IF EXISTS recipe_layers',
      'DROP TABLE IF EXISTS mbe_recipes',
      'DROP TABLE IF EXISTS measurements',
      'DROP TABLE IF EXISTS samples'
    ];
    
    for (const dropStatement of dropStatements) {
      console.log(`Executing: ${dropStatement}`);
      await pool.query(dropStatement);
    }
    
    // Now read the schema SQL, but skip the DROP statements
    const schemaSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'mysql-schema.sql'),
      'utf8'
    );
    
    // Split the SQL into individual statements and filter out DROP statements
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .filter(statement => !statement.toUpperCase().includes('DROP TABLE'));
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.slice(0, 50)}...`);
      await pool.query(statement);
    }
    
    console.log('Database schema initialized successfully');
    
    // Add sample data
    console.log('Adding mock data...');
    const mockDataSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'mock-data.sql'),
      'utf8'
    );
    
    const mockDataStatements = mockDataSQL
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    for (const statement of mockDataStatements) {
      try {
        console.log(`Executing mock data: ${statement.slice(0, 50)}...`);
        await pool.query(statement);
      } catch (error) {
        console.warn(`Warning: Failed to execute statement: ${error.message}`);
      }
    }
    
    console.log('Mock data added successfully');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 