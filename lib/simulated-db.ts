"use server"

import { dbState } from "./simulated-db-state"

// Sample actions
export async function getAllSamples() {
  return dbState.samples
}

export async function getSample(id: string) {
  return dbState.samples.find((sample) => sample.id === id)
}

export async function createSample(sample: any) {
  dbState.samples.push(sample)
  return sample
}

export async function updateSample(id: string, updates: any) {
  const index = dbState.samples.findIndex((sample) => sample.id === id)
  if (index !== -1) {
    dbState.samples[index] = { ...dbState.samples[index], ...updates }
    return dbState.samples[index]
  }
  return null
}

export async function deleteSample(id: string) {
  dbState.samples = dbState.samples.filter((sample) => sample.id !== id)
}

// Measurement actions
export async function getAllMeasurements() {
  return dbState.measurements
}

export async function getMeasurement(id: string) {
  return dbState.measurements.find((measurement) => measurement.id === id)
}

export async function createMeasurement(measurement: any) {
  dbState.measurements.push(measurement)
  return measurement
}

export async function updateMeasurement(id: string, updates: any) {
  const index = dbState.measurements.findIndex((measurement) => measurement.id === id)
  if (index !== -1) {
    dbState.measurements[index] = { ...dbState.measurements[index], ...updates }
    return dbState.measurements[index]
  }
  return null
}

export async function deleteMeasurement(id: string) {
  dbState.measurements = dbState.measurements.filter((measurement) => measurement.id !== id)
}

// Recipe actions
export async function getAllRecipes() {
  return dbState.recipes
}

export async function getRecipe(id: string) {
  return dbState.recipes.find((recipe) => recipe.id === id)
}

export async function createRecipe(recipe: any) {
  dbState.recipes.push(recipe)
  return recipe
}

export async function updateRecipe(id: string, updates: any) {
  const index = dbState.recipes.findIndex((recipe) => recipe.id === id)
  if (index !== -1) {
    dbState.recipes[index] = { ...dbState.recipes[index], ...updates }
    return dbState.recipes[index]
  }
  return null
}

export async function deleteRecipe(id: string) {
  dbState.recipes = dbState.recipes.filter((recipe) => recipe.id !== id)
}

