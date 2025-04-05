import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, unlink } from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import os from "os"

const execPromise = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a temporary file to store the uploaded .mat file
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `matlab_${Date.now()}.mat`)

    // Write the file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(tempFilePath, buffer)

    // Use a Python script to read the .mat file
    // This is more reliable than trying to parse it in Node.js
    const scriptPath = path.join(process.cwd(), "scripts", "parse_matlab.py")
    const outputPath = path.join(tempDir, `matlab_output_${Date.now()}.json`)

    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python ${scriptPath} ${tempFilePath} ${outputPath}`)

    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: "Error parsing MATLAB file" }, { status: 500 })
    }

    // Read the output JSON file
    const outputData = await readFile(outputPath, "utf-8")
    const result = JSON.parse(outputData)

    // Clean up temporary files
    await Promise.all([unlink(tempFilePath).catch(() => {}), unlink(outputPath).catch(() => {})])

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing MATLAB file:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

