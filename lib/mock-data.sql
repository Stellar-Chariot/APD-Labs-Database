-- Mock data for APD Database

-- Insert sample records
INSERT INTO samples (name, equipment_code, year, month, day, material, sample_identifier, description)
VALUES 
  ('A230501GaAsA', 'A', '23', '05', '01', 'GaAs', 'A', 'GaAs quantum well sample'),
  ('A230715InGaAsB', 'A', '23', '07', '15', 'InGaAs', 'B', 'InGaAs quantum dots'),
  ('B230922AlGaAsC', 'B', '23', '09', '22', 'AlGaAs', 'C', 'AlGaAs barrier layers'),
  ('A231005InAlAsD', 'A', '23', '10', '05', 'InAlAs', 'D', 'InAlAs/GaAs heterostructure'),
  ('B231218GaAsE', 'B', '23', '12', '18', 'GaAs', 'E', 'GaAs substrate with doping gradient');

-- Insert measurement records
INSERT INTO measurements (sample_id, name, device_number, experimental_parameter, measurement_type, measurement_date, equipment, operator, description)
VALUES
  (1, 'A230501GaAsA1Tpl', 'PL01', 'T', 'pl', '2023-05-02', 'Horiba LabRAM HR', 'John Smith', 'Room temperature PL measurement'),
  (1, 'A230501GaAsA2Axrd', 'XRD02', 'A', 'xrd', '2023-05-03', 'Bruker D8 Discover', 'Jane Doe', 'Symmetric scan along (004)'),
  (2, 'A230715InGaAsB1Aafm', 'AFM01', 'A', 'afm', '2023-07-16', 'Bruker Dimension Icon', 'Mike Johnson', '5x5 µm scan of surface'),
  (3, 'B230922AlGaAsC1Dsims', 'SIMS01', 'D', 'sims', '2023-09-23', 'CAMECA IMS 7f', 'Sarah Williams', 'Depth profile of Al concentration'),
  (4, 'A231005InAlAsD2Cel', 'EL02', 'C', 'el', '2023-10-06', 'Custom Setup', 'David Brown', 'Current-dependent EL spectra'),
  (5, 'B231218GaAsE1Mhall', 'Hall01', 'M', 'hall', '2023-12-19', 'Lakeshore HMS', 'Emily Davis', 'Temperature-dependent carrier concentration');

-- Insert measurement data
INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
VALUES
  -- PL data for sample 1
  (1, 800, 120, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 810, 350, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 820, 580, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 830, 890, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 840, 650, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 850, 320, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  (1, 860, 120, NULL, '{"integration_time": 1.0, "slit_width": 0.1}'),
  
  -- XRD data for sample 1
  (2, 32.5, 10, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 32.6, 15, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 32.7, 35, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 32.8, 120, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 32.9, 450, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 33.0, 2200, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 33.1, 480, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 33.2, 150, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  (2, 33.3, 40, NULL, '{"step_size": 0.01, "count_time": 1.0}'),
  
  -- AFM data for sample 2 (simplified, real AFM would have many more points)
  (3, 0, 0, 2.5, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  (3, 1, 0, 3.2, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  (3, 2, 0, 8.7, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  (3, 0, 1, 2.8, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  (3, 1, 1, 4.1, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  (3, 2, 1, 7.3, '{"scan_rate": 0.5, "setpoint": 0.8}'),
  
  -- SIMS data for sample 3
  (4, 0, 1000, NULL, '{"beam_energy": 5, "species": "Al"}'),
  (4, 50, 980, NULL, '{"beam_energy": 5, "species": "Al"}'),
  (4, 100, 2500, NULL, '{"beam_energy": 5, "species": "Al"}'),
  (4, 150, 2450, NULL, '{"beam_energy": 5, "species": "Al"}'),
  (4, 200, 950, NULL, '{"beam_energy": 5, "species": "Al"}'),
  (4, 250, 1050, NULL, '{"beam_energy": 5, "species": "Al"}'),
  
  -- EL data for sample 4
  (5, 750, 50, NULL, '{"current": 10, "temperature": 300}'),
  (5, 780, 150, NULL, '{"current": 10, "temperature": 300}'),
  (5, 810, 450, NULL, '{"current": 10, "temperature": 300}'),
  (5, 840, 320, NULL, '{"current": 10, "temperature": 300}'),
  (5, 870, 80, NULL, '{"current": 10, "temperature": 300}'),
  
  -- Hall effect data for sample 5
  (6, 0, 1.2e17, NULL, '{"temperature": 300, "field": 0.5}'),
  (6, 0.2, 1.3e17, NULL, '{"temperature": 300, "field": 0.7}'),
  (6, 0.4, 1.4e17, NULL, '{"temperature": 300, "field": 0.9}'),
  (6, 0.6, 1.5e17, NULL, '{"temperature": 300, "field": 1.1}'),
  (6, 0.8, 1.6e17, NULL, '{"temperature": 300, "field": 1.3}'),
  (6, 1.0, 1.7e17, NULL, '{"temperature": 300, "field": 1.5}');

-- Insert MBE recipes
INSERT INTO mbe_recipes (sample_id, name, growth_temperature, growth_pressure, description)
VALUES
  (1, 'GaAs-QW-Recipe', 580, 5.5e-6, 'Standard recipe for GaAs quantum wells'),
  (2, 'InGaAs-QD-Recipe', 510, 4.8e-6, 'InGaAs quantum dot growth with wetting layer'),
  (3, 'AlGaAs-Barrier-Recipe', 600, 5.2e-6, 'AlGaAs barriers with varying Al content'),
  (4, 'InAlAs-Hetero-Recipe', 550, 5.0e-6, 'InAlAs/GaAs heterostructure recipe'),
  (5, 'GaAs-Doping-Recipe', 590, 5.3e-6, 'GaAs with Si doping gradient');

-- Insert recipe layers
INSERT INTO recipe_layers (recipe_id, layer_number, material, thickness, growth_time, temperature, description)
VALUES
  -- Layers for Recipe 1
  (1, 1, 'GaAs', 500, 1800, 580, 'Buffer layer'),
  (1, 2, 'Al0.3Ga0.7As', 50, 200, 580, 'Lower barrier'),
  (1, 3, 'GaAs', 10, 40, 580, 'Quantum well'),
  (1, 4, 'Al0.3Ga0.7As', 50, 200, 580, 'Upper barrier'),
  (1, 5, 'GaAs', 10, 40, 580, 'Cap layer'),
  
  -- Layers for Recipe 2
  (2, 1, 'GaAs', 300, 1080, 510, 'Buffer layer'),
  (2, 2, 'In0.15Ga0.85As', 1.5, 6, 510, 'Wetting layer'),
  (2, 3, 'In0.4Ga0.6As', 2, 8, 510, 'Quantum dots'),
  (2, 4, 'GaAs', 50, 180, 510, 'Cap layer'),
  
  -- Layers for Recipe 3
  (3, 1, 'GaAs', 400, 1440, 600, 'Buffer layer'),
  (3, 2, 'Al0.2Ga0.8As', 30, 120, 600, 'First barrier'),
  (3, 3, 'Al0.3Ga0.7As', 30, 120, 600, 'Second barrier'),
  (3, 4, 'Al0.4Ga0.6As', 30, 120, 600, 'Third barrier'),
  (3, 5, 'GaAs', 20, 72, 600, 'Cap layer'),
  
  -- Layers for Recipe 4
  (4, 1, 'GaAs', 500, 1800, 550, 'Buffer layer'),
  (4, 2, 'In0.2Al0.8As', 100, 400, 550, 'First layer'),
  (4, 3, 'In0.3Al0.7As', 100, 400, 550, 'Second layer'),
  (4, 4, 'GaAs', 50, 180, 550, 'Cap layer'),
  
  -- Layers for Recipe 5
  (5, 1, 'GaAs', 500, 1800, 590, 'Buffer layer'),
  (5, 2, 'GaAs:Si (1e16)', 200, 720, 590, 'Low doping'),
  (5, 3, 'GaAs:Si (5e16)', 200, 720, 590, 'Medium doping'),
  (5, 4, 'GaAs:Si (1e17)', 200, 720, 590, 'High doping'),
  (5, 5, 'GaAs', 50, 180, 590, 'Cap layer');

-- Insert data import records
INSERT INTO data_imports (measurement_id, filename, file_type, file_size, import_date)
VALUES
  (1, 'A230501GaAsA1Tpl.csv', 'csv', 8192, '2023-05-02 14:23:45'),
  (2, 'A230501GaAsA2Axrd.dat', 'dat', 12800, '2023-05-03 10:15:22'),
  (3, 'A230715InGaAsB1Aafm.txt', 'txt', 51200, '2023-07-16 16:45:12'),
  (4, 'B230922AlGaAsC1Dsims.csv', 'csv', 24576, '2023-09-23 11:32:18'),
  (5, 'A231005InAlAsD2Cel.dat', 'dat', 15360, '2023-10-06 15:20:33'),
  (6, 'B231218GaAsE1Mhall.csv', 'csv', 5120, '2023-12-19 09:11:47'); 