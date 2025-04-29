-- MySQL schema for APD Database

-- Use the scientific_samples database
USE scientific_samples;

-- Drop existing tables if needed (comment out if not needed)
-- DROP TABLE IF EXISTS data_imports;
-- DROP TABLE IF EXISTS measurement_data;
-- DROP TABLE IF EXISTS recipe_layers;
-- DROP TABLE IF EXISTS mbe_recipes;
-- DROP TABLE IF EXISTS measurements;
-- DROP TABLE IF EXISTS samples;

-- Create samples table
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
);

-- Create measurements table
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
);

-- Create measurement_data table
CREATE TABLE measurement_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  measurement_id INT NOT NULL,
  x_value DOUBLE NOT NULL,
  y_value DOUBLE NOT NULL,
  z_value DOUBLE,
  additional_data JSON,
  FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
);

-- Create mbe_recipes table
CREATE TABLE mbe_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sample_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  growth_temperature DOUBLE NOT NULL,
  growth_pressure DOUBLE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
);

-- Create recipe_layers table
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
);

-- Create data_imports table
CREATE TABLE data_imports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  measurement_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_samples_name ON samples(name);
CREATE INDEX idx_measurements_sample_id ON measurements(sample_id);
CREATE INDEX idx_measurements_name ON measurements(name);
CREATE INDEX idx_measurement_data_measurement_id ON measurement_data(measurement_id);
CREATE INDEX idx_mbe_recipes_sample_id ON mbe_recipes(sample_id);
CREATE INDEX idx_recipe_layers_recipe_id ON recipe_layers(recipe_id); 