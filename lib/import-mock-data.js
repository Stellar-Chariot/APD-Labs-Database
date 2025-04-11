const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

async function recreateAndImportData() {
  console.log('Starting database recreation and data import...');
  let connection;
  
  try {
    // Connect to the database using the full connection string
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to MySQL server.');
    
    // Drop existing tables in the correct order (reverse of creation)
    console.log('Dropping existing tables...');
    await executeSql(connection, 'DROP TABLE IF EXISTS data_imports', 'drop data_imports');
    await executeSql(connection, 'DROP TABLE IF EXISTS recipe_layers', 'drop recipe_layers');
    await executeSql(connection, 'DROP TABLE IF EXISTS mbe_recipes', 'drop mbe_recipes');
    await executeSql(connection, 'DROP TABLE IF EXISTS measurement_data', 'drop measurement_data');
    await executeSql(connection, 'DROP TABLE IF EXISTS measurements', 'drop measurements');
    await executeSql(connection, 'DROP TABLE IF EXISTS samples', 'drop samples');
    
    console.log('Creating tables...');
    
    // Create samples table
    await executeSql(connection, `
      CREATE TABLE samples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        equipment_code CHAR(1) NOT NULL,
        year CHAR(2) NOT NULL,
        month CHAR(2) NOT NULL,
        day CHAR(2) NOT NULL,
        material VARCHAR(50) NOT NULL,
        sample_identifier CHAR(1) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, 'create samples table');
    
    // Create measurements table
    await executeSql(connection, `
      CREATE TABLE measurements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sample_id INT NOT NULL,
        name VARCHAR(255) NOT NULL UNIQUE,
        device_number VARCHAR(10) NOT NULL,
        experimental_parameter VARCHAR(50),
        measurement_type VARCHAR(50) NOT NULL,
        measurement_date DATE NOT NULL,
        equipment VARCHAR(100),
        operator VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
      )
    `, 'create measurements table');
    
    // Create measurement_data table
    await executeSql(connection, `
      CREATE TABLE measurement_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        measurement_id INT NOT NULL,
        x_value DOUBLE NOT NULL,
        y_value DOUBLE NOT NULL,
        z_value DOUBLE,
        additional_data JSON,
        FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
      )
    `, 'create measurement_data table');
    
    // Create mbe_recipes table
    await executeSql(connection, `
      CREATE TABLE mbe_recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sample_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        growth_temperature DOUBLE NOT NULL,
        growth_pressure DOUBLE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
      )
    `, 'create mbe_recipes table');
    
    // Create recipe_layers table
    await executeSql(connection, `
      CREATE TABLE recipe_layers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        layer_number INT NOT NULL,
        material VARCHAR(100) NOT NULL,
        thickness DOUBLE NOT NULL,
        growth_time INT NOT NULL,
        temperature DOUBLE NOT NULL,
        description TEXT,
        UNIQUE(recipe_id, layer_number),
        FOREIGN KEY (recipe_id) REFERENCES mbe_recipes(id) ON DELETE CASCADE
      )
    `, 'create recipe_layers table');
    
    // Create data_imports table
    await executeSql(connection, `
      CREATE TABLE data_imports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        measurement_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INT NOT NULL,
        import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
      )
    `, 'create data_imports table');
    
    // Add indexes
    await executeSql(connection, 'CREATE INDEX idx_samples_name ON samples(name)', 'create index on samples.name');
    await executeSql(connection, 'CREATE INDEX idx_measurements_sample_id ON measurements(sample_id)', 'create index on measurements.sample_id');
    await executeSql(connection, 'CREATE INDEX idx_measurements_name ON measurements(name)', 'create index on measurements.name');
    await executeSql(connection, 'CREATE INDEX idx_measurement_data_measurement_id ON measurement_data(measurement_id)', 'create index on measurement_data.measurement_id');
    await executeSql(connection, 'CREATE INDEX idx_mbe_recipes_sample_id ON mbe_recipes(sample_id)', 'create index on mbe_recipes.sample_id');
    await executeSql(connection, 'CREATE INDEX idx_recipe_layers_recipe_id ON recipe_layers(recipe_id)', 'create index on recipe_layers.recipe_id');
    
    console.log('Schema created successfully. Importing mock data...');
    
    // Import sample data
    await executeSql(connection, `
      INSERT INTO samples (name, equipment_code, year, month, day, material, sample_identifier, description)
      VALUES 
        ('A230501GaAsA', 'A', '23', '05', '01', 'GaAs', 'A', 'GaAs quantum well sample'),
        ('A230715InGaAsB', 'A', '23', '07', '15', 'InGaAs', 'B', 'InGaAs quantum dots'),
        ('B230922AlGaAsC', 'B', '23', '09', '22', 'AlGaAs', 'C', 'AlGaAs barrier layers'),
        ('A231005InAlAsD', 'A', '23', '10', '05', 'InAlAs', 'D', 'InAlAs/GaAs heterostructure'),
        ('B231218GaAsE', 'B', '23', '12', '18', 'GaAs', 'E', 'GaAs substrate with doping gradient')
    `, 'insert samples');
    
    // Import measurement data
    await executeSql(connection, `
      INSERT INTO measurements (sample_id, name, device_number, experimental_parameter, measurement_type, measurement_date, equipment, operator, description)
      VALUES
        (1, 'A230501GaAsA1Tpl', 'PL01', 'T', 'pl', '2023-05-02', 'Horiba LabRAM HR', 'John Smith', 'Room temperature PL measurement'),
        (1, 'A230501GaAsA2Axrd', 'XRD02', 'A', 'xrd', '2023-05-03', 'Bruker D8 Discover', 'Jane Doe', 'Symmetric scan along (004)'),
        (2, 'A230715InGaAsB1Aafm', 'AFM01', 'A', 'afm', '2023-07-16', 'Bruker Dimension Icon', 'Mike Johnson', '5x5 µm scan of surface'),
        (3, 'B230922AlGaAsC1Dsims', 'SIMS01', 'D', 'sims', '2023-09-23', 'CAMECA IMS 7f', 'Sarah Williams', 'Depth profile of Al concentration'),
        (4, 'A231005InAlAsD2Cel', 'EL02', 'C', 'el', '2023-10-06', 'Custom Setup', 'David Brown', 'Current-dependent EL spectra'),
        (5, 'B231218GaAsE1Mhall', 'Hall01', 'M', 'hall', '2023-12-19', 'Lakeshore HMS', 'Emily Davis', 'Temperature-dependent carrier concentration')
    `, 'insert measurements');
    
    // Insert measurement data (PL data for sample 1)
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (1, 800, 120, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 810, 350, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 820, 580, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 830, 890, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 840, 650, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 850, 320, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
        (1, 860, 120, NULL, '{"integration_time": 1.0, "slit_width": 0.1}')
    `, 'insert PL measurement data');
    
    // Insert XRD data for sample 1
    await executeSql(connection, `
      INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
      VALUES
        (2, 32.5, 10, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 32.6, 15, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 32.7, 35, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 32.8, 120, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 32.9, 450, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 33.0, 2200, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 33.1, 480, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 33.2, 150, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
        (2, 33.3, 40, NULL, '{"step_size": 0.01, "count_time": 1.0}')
    `, 'insert XRD measurement data');
    
    // Insert MBE recipes
    await executeSql(connection, `
      INSERT INTO mbe_recipes (sample_id, name, growth_temperature, growth_pressure, description)
      VALUES
        (1, 'GaAs-QW-Recipe', 580, 5.5e-6, 'Standard recipe for GaAs quantum wells'),
        (2, 'InGaAs-QD-Recipe', 510, 4.8e-6, 'InGaAs quantum dot growth with wetting layer'),
        (3, 'AlGaAs-Barrier-Recipe', 600, 5.2e-6, 'AlGaAs barriers with varying Al content'),
        (4, 'InAlAs-Hetero-Recipe', 550, 5.0e-6, 'InAlAs/GaAs heterostructure recipe'),
        (5, 'GaAs-Doping-Recipe', 590, 5.3e-6, 'GaAs with Si doping gradient')
    `, 'insert MBE recipes');
    
    // Insert recipe layers for Recipe 1
    await executeSql(connection, `
      INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
      VALUES
        (1, 1, 'GaAs', 500, 1800, 580, 'Buffer layer'),
        (1, 2, 'Al0.3Ga0.7As', 50, 200, 580, 'Lower barrier'),
        (1, 3, 'GaAs', 10, 40, 580, 'Quantum well'),
        (1, 4, 'Al0.3Ga0.7As', 50, 200, 580, 'Upper barrier'),
        (1, 5, 'GaAs', 10, 40, 580, 'Cap layer')
    `, 'insert recipe layers for recipe 1');
    
    // Insert recipe layers for Recipe 2
    await executeSql(connection, `
      INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
      VALUES
        (2, 1, 'GaAs', 300, 1080, 510, 'Buffer layer'),
        (2, 2, 'In0.15Ga0.85As', 1.5, 6, 510, 'Wetting layer'),
        (2, 3, 'In0.4Ga0.6As', 2, 8, 510, 'Quantum dots'),
        (2, 4, 'GaAs', 50, 180, 510, 'Cap layer')
    `, 'insert recipe layers for recipe 2');
    
    // Insert data import records
    await executeSql(connection, `
      INSERT INTO data_imports (measurement_id, filename, file_type, file_size, import_date)
      VALUES
        (1, 'A230501GaAsA1Tpl.csv', 'csv', 8192, '2023-05-02 14:23:45'),
        (2, 'A230501GaAsA2Axrd.dat', 'dat', 12800, '2023-05-03 10:15:22'),
        (3, 'A230715InGaAsB1Aafm.txt', 'txt', 51200, '2023-07-16 16:45:12'),
        (4, 'B230922AlGaAsC1Dsims.csv', 'csv', 24576, '2023-09-23 11:32:18'),
        (5, 'A231005InAlAsD2Cel.dat', 'dat', 15360, '2023-10-06 15:20:33'),
        (6, 'B231218GaAsE1Mhall.csv', 'csv', 5120, '2023-12-19 09:11:47')
    `, 'insert data import records');
    
    console.log('Database recreation and mock data import completed successfully!');
  } catch (error) {
    console.error('Error during database recreation and import:', error);
  } finally {
    // Close the connection if it was created
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
recreateAndImportData(); 