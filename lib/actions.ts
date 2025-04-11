"use server"

import mysql from 'mysql2/promise'
import { revalidatePath } from "next/cache"
import { getPool } from './database'

// Define MySQL result types
type MySQLRow = Record<string, any>
type MySQLQueryResult = [MySQLRow[], mysql.FieldPacket[]]
type MySQLInsertResult = [mysql.ResultSetHeader, mysql.FieldPacket[]]

// Dashboard summary data
export async function getSummaryData() {
  const pool = await getPool()
  
  // Sample count
  const [sampleCountResult] = await pool.query('SELECT COUNT(*) as count FROM samples')
  // Measurement count
  const [measurementCountResult] = await pool.query('SELECT COUNT(*) as count FROM measurements')
  // Recipe count
  const [recipeCountResult] = await pool.query('SELECT COUNT(*) as count FROM mbe_recipes')
  // Data point count
  const [dataPointCountResult] = await pool.query('SELECT COUNT(*) as count FROM measurement_data')
  
  return {
    sampleCount: Number(sampleCountResult[0]?.count || 0),
    measurementCount: Number(measurementCountResult[0]?.count || 0),
    recipeCount: Number(recipeCountResult[0]?.count || 0),
    dataPointCount: Number(dataPointCountResult[0]?.count || 0),
  }
}

// Sample actions
export async function getSamples() {
  const pool = await getPool()
  const [samples] = await pool.query('SELECT * FROM samples ORDER BY created_at DESC')
  return samples
}

export async function getSampleById(id: number) {
  const pool = await getPool()
  const [results] = await pool.query('SELECT * FROM samples WHERE id = ?', [id])
  return results[0]
}

export async function createSample(formData: FormData) {
  const pool = await getPool()
  
  const equipment_code = formData.get("equipment_code") as string
  const year = formData.get("year") as string
  const month = formData.get("month") as string
  const day = formData.get("day") as string
  const material = formData.get("material") as string
  const sample_identifier = formData.get("sample_identifier") as string
  const description = formData.get("description") as string

  // Generate the sample name based on the naming convention
  const name = `${equipment_code}${year}${month}${day}${material}${sample_identifier}`

  const [result] = await pool.query(
    `INSERT INTO samples (name, equipment_code, year, month, day, material, sample_identifier, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, equipment_code, year, month, day, material, sample_identifier, description]
  )
  
  revalidatePath("/samples")
  return { success: true, name }
}

// Measurement actions
export async function getMeasurements() {
  const pool = await getPool()
  const [measurements] = await pool.query(
    `SELECT m.*, s.name as sample_name 
     FROM measurements m
     JOIN samples s ON m.sample_id = s.id
     ORDER BY m.created_at DESC`
  )
  return measurements
}

export async function getMeasurementById(id: number) {
  const pool = await getPool()
  const [results] = await pool.query(
    `SELECT m.*, s.name as sample_name 
     FROM measurements m
     JOIN samples s ON m.sample_id = s.id
     WHERE m.id = ?`,
    [id]
  )
  return results[0]
}

export async function getMeasurementData(id: number) {
  const pool = await getPool()
  const [data] = await pool.query(
    `SELECT * FROM measurement_data 
     WHERE measurement_id = ?
     ORDER BY x_value ASC`,
    [id]
  )
  return data
}

// Recipe actions
export async function getRecipes() {
  const pool = await getPool()
  const [recipes] = await pool.query(
    `SELECT r.*, s.name as sample_name 
     FROM mbe_recipes r
     JOIN samples s ON r.sample_id = s.id
     ORDER BY r.created_at DESC`
  )
  return recipes
}

export async function getRecipeById(id: number) {
  const pool = await getPool()
  const [recipe] = await pool.query(
    `SELECT r.*, s.name as sample_name 
     FROM mbe_recipes r
     JOIN samples s ON r.sample_id = s.id
     WHERE r.id = ?`,
    [id]
  )

  const [layers] = await pool.query(
    `SELECT * FROM recipe_layers 
     WHERE recipe_id = ?
     ORDER BY layer_number ASC`,
    [id]
  )

  return {
    recipe: recipe[0],
    layers,
  }
}

// New function to get recipes for a specific sample
export async function getRecipesForSample(sampleId: number) {
  const pool = await getPool()
  const [recipes] = await pool.query(
    `SELECT r.*, s.name as sample_name 
     FROM mbe_recipes r
     JOIN samples s ON r.sample_id = s.id
     WHERE r.sample_id = ?
     ORDER BY r.created_at DESC`,
    [sampleId]
  )

  // If there are no recipes, return empty arrays
  if (recipes.length === 0) {
    return {
      recipes: [],
      layers: [],
    }
  }

  // Get the first recipe's layers (assuming we want to show the most recent recipe)
  const [layers] = await pool.query(
    `SELECT * FROM recipe_layers 
     WHERE recipe_id = ?
     ORDER BY layer_number ASC`,
    [recipes[0].id]
  )

  return {
    recipes,
    layers,
  }
}

export async function createMeasurement(formData: FormData) {
  const pool = await getPool()
  const sample_id = Number(formData.get("sample_id") as string)
  const device_number = formData.get("device_number") as string
  const experimental_parameter = formData.get("experimental_parameter") as string
  const measurement_type = formData.get("measurement_type") as string
  const measurement_date = formData.get("measurement_date") as string
  const equipment = formData.get("equipment") as string
  const operator = formData.get("operator") as string
  const description = formData.get("description") as string
  const has_data = formData.get("has_data") === "true"

  // Get the sample to generate the measurement name
  const [sampleResults] = await pool.query(
    'SELECT * FROM samples WHERE id = ?',
    [sample_id]
  )
  const sample = sampleResults[0]

  if (!sample) {
    throw new Error("Sample not found")
  }

  // Generate the measurement name based on the naming convention
  const name = `${sample.name}${device_number}${experimental_parameter}${measurement_type}`

  // Insert the measurement - MySQL doesn't support RETURNING, so we need to use insertId
  const [result] = await pool.query(
    `INSERT INTO measurements (
      name, sample_id, device_number, experimental_parameter, measurement_type, 
      measurement_date, equipment, operator, description
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, sample_id, device_number, experimental_parameter, measurement_type, 
     measurement_date, equipment, operator, description]
  )
  
  const measurement_id = result.insertId

  // If data was provided, process and insert it
  if (has_data) {
    const filename = formData.get("filename") as string
    const file_type = formData.get("file_type") as string
    const file_size = Number(formData.get("file_size") as string)
    const data = JSON.parse(formData.get("data") as string)

    // Create the data import record
    const [importResult] = await pool.query(
      `INSERT INTO data_imports (measurement_id, filename, file_type, file_size)
       VALUES (?, ?, ?, ?)`,
      [measurement_id, filename, file_type, file_size]
    )

    // Insert the data points
    for (const point of data) {
      await pool.query(
        `INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
         VALUES (?, ?, ?, ?, ?)`,
        [measurement_id, point.x || null, point.y || null, point.z || null, 
         // Convert additional_data object to JSON string for MySQL
         point.additional_data ? JSON.stringify(point.additional_data) : null]
      )
    }
  }

  revalidatePath("/measurements")
  return { success: true, name, id: measurement_id }
}

export async function createRecipe(formData: FormData) {
  const pool = await getPool()
  const sample_id = Number(formData.get("sample_id") as string)
  const name = formData.get("name") as string
  const growth_temperature = Number(formData.get("growth_temperature") as string)
  const growth_pressure = Number(formData.get("growth_pressure") as string)
  const description = formData.get("description") as string

  // MySQL doesn't support RETURNING, remove that clause
  const [result] = await pool.query(
    `INSERT INTO mbe_recipes (sample_id, name, growth_temperature, growth_pressure, description)
     VALUES (?, ?, ?, ?, ?)`,
    [sample_id, name, growth_temperature, growth_pressure, description]
  )

  revalidatePath("/recipes")
  return { success: true, id: result.insertId }
}

export async function addRecipeLayer(formData: FormData) {
  const pool = await getPool()
  const recipe_id = Number(formData.get("recipe_id") as string)
  const layer_number = Number(formData.get("layer_number") as string)
  const material = formData.get("material") as string
  const thickness = Number(formData.get("thickness") as string)
  const growth_time = Number(formData.get("growth_time") as string)
  const temperature = Number(formData.get("temperature") as string)
  const description = formData.get("description") as string

  await pool.query(
    `INSERT INTO recipe_layers (
      recipe_id, layer_number, material, thickness, growth_time, temperature, description
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recipe_id, layer_number, material, thickness, growth_time, temperature, description]
  )

  revalidatePath(`/recipes/${recipe_id}`)
  return { success: true }
}

// Data import actions
export async function importData(formData: FormData) {
  const pool = await getPool()
  const measurement_id = Number(formData.get("measurement_id") as string)
  const filename = formData.get("filename") as string
  const file_type = formData.get("file_type") as string
  const file_size = Number(formData.get("file_size") as string)
  const data = JSON.parse(formData.get("data") as string)

  // MySQL doesn't support RETURNING, remove that clause
  const [importResult] = await pool.query(
    `INSERT INTO data_imports (measurement_id, filename, file_type, file_size)
     VALUES (?, ?, ?, ?)`,
    [measurement_id, filename, file_type, file_size]
  )

  const import_id = importResult.insertId

  // Insert the data points
  for (const point of data) {
    await pool.query(
      `INSERT INTO measurement_data (measurement_id, x_value, y_value, z_value, additional_data)
       VALUES (?, ?, ?, ?, ?)`,
      [measurement_id, point.x || null, point.y || null, point.z || null,
       // Convert additional_data object to JSON string for MySQL
       point.additional_data ? JSON.stringify(point.additional_data) : null]
    )
  }

  revalidatePath(`/measurements/${measurement_id}`)
  return { success: true, import_id }
}