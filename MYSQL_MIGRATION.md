# MySQL Migration Guide

This document outlines the process for migrating the Scientific Samples Database from Neon PostgreSQL to MySQL.

## Prerequisites

1. MySQL server installed and configured
2. MySQL client tools (mysql CLI or a GUI like MySQL Workbench)
3. Access credentials for both the source PostgreSQL database and target MySQL database

## Migration Steps

### 1. Install Required Dependencies

```bash
npm install mysql2 --save --legacy-peer-deps
```

### 2. Create MySQL Database

Create a new MySQL database for the project:

```sql
CREATE DATABASE scientific_samples CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create Database Schema

Execute the MySQL schema script to create the necessary tables:

```bash
mysql -u username -p scientific_samples < lib/mysql-schema.sql
```

Or use a MySQL client to run the SQL from `lib/mysql-schema.sql`.

### 4. Update Environment Variables

Update your `.env.local` file to use the MySQL connection string:

```
# Old PostgreSQL connection
# DATABASE_URL=postgres://user:password@host:port/database

# New MySQL connection
DATABASE_URL=mysql://username:password@localhost:3306/scientific_samples
```

### 5. Data Migration

If you have existing data in PostgreSQL that needs to be migrated, you have several options:

#### Option A: Manual Export/Import (for small datasets)

1. Export data from PostgreSQL tables to CSV files
2. Import the CSV files into MySQL using LOAD DATA INFILE

#### Option B: Use a Migration Tool (for larger datasets)

1. Use a tool like [pgloader](https://pgloader.readthedocs.io/) which can migrate directly from PostgreSQL to MySQL
2. Follow the pgloader documentation for migration specifics

### 6. Testing

After migration:

1. Verify all data has been transferred correctly
2. Test all application functionality to ensure it works with MySQL
3. Check performance of key queries

## Key Changes in the Codebase

The migration from Neon PostgreSQL to MySQL involved the following changes:

1. Replacing the Neon client with mysql2/promise client
2. Updating query syntax to use parameterized queries with `?` placeholders
3. Handling insertions differently (MySQL doesn't support RETURNING clause)
4. Managing connection pooling
5. Adjusting JSON field handling

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify MySQL username, password, host, and database name
2. **Data Type Mismatches**: Check data types between PostgreSQL and MySQL tables
3. **JSON Handling**: Ensure JSON fields are properly stringified when inserted
4. **Character Set Issues**: Check for UTF-8 encoding issues in text data

### Performance Considerations

1. MySQL may require different indexing strategies than PostgreSQL
2. Connection pooling configuration may need adjustment for optimal performance
3. Complex queries may need optimization for MySQL's query planner

## Rollback Plan

If issues arise with the MySQL migration:

1. Keep the PostgreSQL database active during the transition
2. Update the environment variables to point back to PostgreSQL
3. Revert the code changes in `lib/actions.ts` 