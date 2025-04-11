const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function executeSql(connection, sql, description = '') {
  try {
    await connection.query(sql);
    if (description) {
      console.log(`Successfully executed: ${description}`);
    }
    return true;
  } catch (error) {
    console.error(`Error executing SQL ${description ? `(${description})` : ''}: ${error.message}`);
    return false;
  }
}

async function addMissingData() {
  console.log('Adding missing recipe layers and measurement data...');
  let connection;
  
  try {
    // Connect to the database using the connection string
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to MySQL server.');
    
    // Add recipe layers for Recipe 3 (AlGaAs-Barrier-Recipe)
    await executeSql(connection, `
      INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
      VALUES
        (3, 1, 'GaAs', 400, 1400, 600, 'Buffer layer'),
        (3, 2, 'Al0.1Ga0.9As', 30, 100, 600, 'First barrier layer (10% Al)'),
        (3, 3, 'Al0.2Ga0.8As', 30, 100, 600, 'Second barrier layer (20% Al)'),
        (3, 4, 'Al0.3Ga0.7As', 30, 100, 600, 'Third barrier layer (30% Al)'),
        (3, 5, 'GaAs', 15, 50, 600, 'Cap layer')
    `, 'insert recipe layers for recipe 3');
    
    // Add recipe layers for Recipe 4 (InAlAs-Hetero-Recipe)
    await executeSql(connection, `
      INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
      VALUES
        (4, 1, 'GaAs', 350, 1200, 550, 'Buffer layer'),
        (4, 2, 'In0.3Al0.7As', 40, 180, 550, 'Lower InAlAs layer'),
        (4, 3, 'GaAs', 8, 35, 550, 'GaAs interlayer'),
        (4, 4, 'In0.3Al0.7As', 40, 180, 550, 'Upper InAlAs layer'),
        (4, 5, 'GaAs', 20, 70, 550, 'Cap layer')
    `, 'insert recipe layers for recipe 4');
    
    // Add recipe layers for Recipe 5 (GaAs-Doping-Recipe)
    await executeSql(connection, `
      INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
      VALUES
        (5, 1, 'GaAs', 300, 1000, 590, 'Buffer layer'),
        (5, 2, 'GaAs:Si (1e17)', 50, 180, 590, 'Low doping region'),
        (5, 3, 'GaAs:Si (5e17)', 50, 180, 590, 'Medium doping region'),
        (5, 4, 'GaAs:Si (1e18)', 50, 180, 590, 'High doping region'),
        (5, 5, 'GaAs', 15, 50, 590, 'Undoped cap layer')
    `, 'insert recipe layers for recipe 5');
    
    // Add measurement data for AFM scan (measurement_id = 3)
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (3, 0, 0, 2.3, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 1, 0, 2.5, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 2, 0, 5.8, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 3, 0, 8.2, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 4, 0, 6.1, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 0, 1, 2.4, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 1, 1, 3.2, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 2, 1, 4.9, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 3, 1, 7.8, '{"scan_rate": 0.5, "set_point": 0.8}'),
        (3, 4, 1, 5.6, '{"scan_rate": 0.5, "set_point": 0.8}')
    `, 'insert AFM measurement data');
    
    // Add measurement data for SIMS depth profile (measurement_id = 4)
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (4, 0, 0.05, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 20, 0.12, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 40, 0.28, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 60, 0.31, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 80, 0.25, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 100, 0.22, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 120, 0.08, NULL, '{"beam_current": 50, "raster_size": 250}'),
        (4, 140, 0.04, NULL, '{"beam_current": 50, "raster_size": 250}')
    `, 'insert SIMS depth profile data');
    
    // Add measurement data for EL spectra (measurement_id = 5)
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (5, 750, 0.05, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 760, 0.12, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 770, 0.22, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 780, 0.38, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 790, 0.64, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 800, 0.81, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 810, 0.95, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 820, 0.76, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 830, 0.45, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 840, 0.28, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 850, 0.13, NULL, '{"current": 10, "integration_time": 2.0}'),
        (5, 860, 0.06, NULL, '{"current": 10, "integration_time": 2.0}')
    `, 'insert EL spectra data');
    
    // Add measurement data for Hall measurement (measurement_id = 6)
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (6, 10, 3.2e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 50, 2.8e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 100, 2.4e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 150, 2.1e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 200, 1.8e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 250, 1.6e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}'),
        (6, 300, 1.4e17, NULL, '{"magnetic_field": 0.5, "current": 1.0}')
    `, 'insert Hall measurement data');
    
    console.log('Successfully added missing recipe layers and measurement data!');
    
  } catch (error) {
    console.error('Error adding missing data:', error);
  } finally {
    // Close the connection if it was created
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
addMissingData(); 