# Database Architecture and Dashboard Integration

## Overview
This document explains the architecture of the Scientific Samples Database and how it integrates with the dashboard interface. The system consists of a MySQL database backend and a Next.js frontend dashboard.

## Database Structure

### Core Tables

1. **samples**
   - Primary table storing sample information
   - Fields: id, name, equipment_code, year, month, day, material, sample_identifier, description
   - Unique constraint on name field
   - Links to measurements and MBE recipes

2. **measurements**
   - Stores measurement data for each sample
   - Fields: id, sample_id, name, device_number, experimental_parameter, measurement_type, etc.
   - Foreign key relationship with samples table
   - Links to measurement_data table

3. **measurement_data**
   - Stores actual measurement values
   - Fields: id, measurement_id, x_value, y_value, z_value, additional_data
   - Supports JSON data for flexible additional information
   - Foreign key relationship with measurements table

4. **mbe_recipes**
   - Stores MBE growth recipes
   - Fields: id, sample_id, name, growth_temperature, growth_pressure, description
   - Links to recipe_layers table
   - Foreign key relationship with samples table

5. **recipe_layers**
   - Stores individual layers for MBE recipes
   - Fields: id, recipe_id, layer_number, material, thickness, growth_time, temperature
   - Unique constraint on (recipe_id, layer_number)
   - Foreign key relationship with mbe_recipes table

### Database Connections

```typescript
// lib/database.ts
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'APDCreol123!',
  database: 'scientific_samples',
  port: 3306,
  connectionLimit: 10,
  waitForConnections: true,
  allowPublicKeyRetrieval: true
}
```

## Dashboard Integration

### Frontend-Backend Communication

1. **Server Actions**
   - Located in `lib/actions.ts`
   - Handles all database operations
   - Uses mysql2/promise for async operations
   - Implements connection pooling for efficiency

2. **Data Flow**
   ```
   Dashboard UI -> Server Action -> Database Connection Pool -> MySQL Database
   ```

3. **Key Operations**
   - Sample creation and management
   - Measurement data entry and retrieval
   - Recipe management
   - Data visualization

### Security Implementation

1. **Connection Security**
   - Password-protected database access
   - Connection pooling for resource management
   - Prepared statements to prevent SQL injection

2. **Network Security**
   - Port forwarding for controlled access
   - IP-based access control
   - SSL recommendations for production

## Data Visualization

### Dashboard Components

1. **Sample Management**
   - Sample creation and editing
   - Sample search and filtering
   - Sample metadata display

2. **Measurement Display**
   - Real-time data visualization
   - Historical data comparison
   - Export capabilities

3. **Recipe Management**
   - Recipe creation and editing
   - Layer visualization
   - Growth parameter tracking

## Error Handling

1. **Database Errors**
   - Connection error handling
   - Query error handling
   - Transaction rollback support

2. **User Feedback**
   - Error messages
   - Success notifications
   - Loading states

## Performance Considerations

1. **Database Optimization**
   - Indexed fields for faster queries
   - Connection pooling
   - Query optimization

2. **Frontend Optimization**
   - Data caching
   - Lazy loading
   - Pagination

## Network Configuration

### Port Configuration
- Port 3000: Next.js dashboard
- Port 3306: MySQL database

### Remote Access
- Configured for network access
- Security measures in place
- Authentication required

## Development Guidelines

1. **Database Changes**
   - Use migrations for schema changes
   - Maintain backward compatibility
   - Document all changes

2. **Dashboard Updates**
   - Follow React best practices
   - Maintain type safety
   - Implement proper error handling

## Troubleshooting

1. **Common Issues**
   - Connection problems
   - Query performance
   - Data synchronization

2. **Solutions**
   - Connection pool management
   - Query optimization
   - Error logging

## Future Improvements

1. **Planned Enhancements**
   - Advanced data visualization
   - Automated backups
   - Enhanced security features

2. **Scalability**
   - Database sharding
   - Caching implementation
   - Load balancing 