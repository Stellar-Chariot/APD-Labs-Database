import { generateSampleData } from "@/lib/sample-data-generator"

// Simulated in-memory database state
export const dbState = {
  samples: generateSampleData().samples,
  measurements: generateSampleData().measurements,
  recipes: generateSampleData().mbeRecipes,
} 