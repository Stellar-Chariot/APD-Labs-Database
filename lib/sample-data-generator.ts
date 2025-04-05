import type { Sample } from "@/types/sample"
import type { Measurement } from "@/types/measurement"
import type { MBERecipe } from "@/types/mbe-recipe"

export function generateSampleData() {
  const samples: Sample[] = [
    {
      id: "T250306GaNA",
      name: "T250306GaNA - GaN Sample A",
      description: "GaN on sapphire substrate, grown by MOCVD",
      type: "GaN",
      createdAt: new Date("2023-03-06").toISOString(),
      updatedAt: new Date("2023-03-06").toISOString(),
      metadata: {
        substrate: "Sapphire",
        thickness: "2.5 μm",
        growthMethod: "MOCVD",
      },
    },
    {
      id: "T250306GaNB",
      name: "T250306GaNB - GaN Sample B",
      description: "GaN on silicon substrate, grown by MBE",
      type: "GaN",
      createdAt: new Date("2023-03-07").toISOString(),
      updatedAt: new Date("2023-03-07").toISOString(),
      metadata: {
        substrate: "Silicon",
        thickness: "1.8 μm",
        growthMethod: "MBE",
      },
    },
    {
      id: "T250308AlGaN",
      name: "T250308AlGaN - AlGaN Sample",
      description: "AlGaN/GaN heterostructure on SiC substrate",
      type: "AlGaN",
      createdAt: new Date("2023-03-08").toISOString(),
      updatedAt: new Date("2023-03-08").toISOString(),
      metadata: {
        substrate: "SiC",
        thickness: "2.2 μm",
        growthMethod: "MOCVD",
        alContent: "25%",
      },
    },
    {
      id: "T250310InGaNA",
      name: "T250310InGaNA - InGaN Sample A QW",
      description: "InGaN/GaN quantum well structure",
      type: "InGaN",
      createdAt: new Date("2023-03-10").toISOString(),
      updatedAt: new Date("2023-03-10").toISOString(),
      metadata: {
        substrate: "Sapphire",
        thickness: "3.0 μm",
        growthMethod: "MOCVD",
        inContent: "15%",
        qwCount: "5",
        qwThickness: "3 nm",
        barrierThickness: "10 nm",
      },
    },
  ]

  // Base measurements
  const measurements: Measurement[] = [
    {
      id: "T250306GaNA1xrd",
      sampleId: "T250306GaNA",
      name: "T250306GaNA1xrd - XRD Measurement 1",
      type: "xrd",
      date: new Date("2023-03-06T10:30:00").toISOString(),
      data: generateXRDData(),
      metadata: {
        peakPositions: [34.56, 72.9],
        fwhm: [0.25, 0.35],
        scanRange: "20-80°",
        scanStep: "0.01°",
      },
      createdAt: new Date("2023-03-06T10:30:00").toISOString(),
      updatedAt: new Date("2023-03-06T10:30:00").toISOString(),
    },
    {
      id: "T250306GaNA2pl",
      sampleId: "T250306GaNA",
      name: "T250306GaNA2pl - PL Measurement 1",
      type: "pl",
      date: new Date("2023-03-06T14:15:00").toISOString(),
      data: generatePLData(),
      metadata: {
        peakWavelength: 365,
        fwhm: 15,
        excitationWavelength: 325,
        temperature: 300,
        power: 10,
      },
      createdAt: new Date("2023-03-06T14:15:00").toISOString(),
      updatedAt: new Date("2023-03-06T14:15:00").toISOString(),
    },
    {
      id: "T250306GaNA3el",
      sampleId: "T250306GaNA",
      name: "T250306GaNA3el - EL Measurement 1",
      type: "el",
      date: new Date("2023-03-06T16:30:00").toISOString(),
      data: generateELData(),
      metadata: {
        peakWavelength: 500,
        fwhm: 25,
        voltage: "3.5V",
        current: "20mA",
        temperature: 300,
      },
      createdAt: new Date("2023-03-06T16:30:00").toISOString(),
      updatedAt: new Date("2023-03-06T16:30:00").toISOString(),
    },
    {
      id: "T250306GaNB1xrd",
      sampleId: "T250306GaNB",
      name: "T250306GaNB1xrd - XRD Measurement 1",
      type: "xrd",
      date: new Date("2023-03-07T09:45:00").toISOString(),
      data: generateXRDData(),
      metadata: {
        peakPositions: [34.58, 72.92],
        fwhm: [0.28, 0.38],
        scanRange: "20-80°",
        scanStep: "0.01°",
      },
      createdAt: new Date("2023-03-07T09:45:00").toISOString(),
      updatedAt: new Date("2023-03-07T09:45:00").toISOString(),
    },
    {
      id: "T250306GaNB2hall",
      sampleId: "T250306GaNB",
      name: "T250306GaNB2hall - Hall Measurement 1",
      type: "hall",
      date: new Date("2023-03-07T11:30:00").toISOString(),
      data: generateHallData(),
      metadata: {
        carrierConcentration: "5.2e17",
        mobility: 1250,
        resistivity: "0.0095",
        carrierType: "n-type",
        temperature: 300,
        contactConfiguration: "van der Pauw",
      },
      createdAt: new Date("2023-03-07T11:30:00").toISOString(),
      updatedAt: new Date("2023-03-07T11:30:00").toISOString(),
    },
    {
      id: "T250308AlGaN1xrd",
      sampleId: "T250308AlGaN",
      name: "T250308AlGaN1xrd - XRD Measurement 1",
      type: "xrd",
      date: new Date("2023-03-08T10:15:00").toISOString(),
      data: generateXRDData(),
      metadata: {
        peakPositions: [34.42, 72.75],
        fwhm: [0.22, 0.32],
        scanRange: "20-80°",
        scanStep: "0.01°",
      },
      createdAt: new Date("2023-03-08T10:15:00").toISOString(),
      updatedAt: new Date("2023-03-08T10:15:00").toISOString(),
    },
    {
      id: "T250308AlGaN2pl",
      sampleId: "T250308AlGaN",
      name: "T250308AlGaN2pl - PL Measurement 1",
      type: "pl",
      date: new Date("2023-03-08T13:45:00").toISOString(),
      data: generatePLData(),
      metadata: {
        peakWavelength: 340,
        fwhm: 18,
        excitationWavelength: 325,
        temperature: 300,
        power: 10,
      },
      createdAt: new Date("2023-03-08T13:45:00").toISOString(),
      updatedAt: new Date("2023-03-08T13:45:00").toISOString(),
    },
    {
      id: "T250310InGaNA1xrd",
      sampleId: "T250310InGaNA",
      name: "T250310InGaNA1xrd - XRD Measurement 1",
      type: "xrd",
      date: new Date("2023-03-10T09:30:00").toISOString(),
      data: generateXRDData(),
      metadata: {
        peakPositions: [34.3, 72.65],
        fwhm: [0.3, 0.4],
        scanRange: "20-80°",
        scanStep: "0.01°",
      },
      createdAt: new Date("2023-03-10T09:30:00").toISOString(),
      updatedAt: new Date("2023-03-10T09:30:00").toISOString(),
    },
    {
      id: "T250310InGaNA2pl",
      sampleId: "T250310InGaNA",
      name: "T250310InGaNA2pl - PL Measurement 1",
      type: "pl",
      date: new Date("2023-03-10T14:00:00").toISOString(),
      data: generatePLData(),
      metadata: {
        peakWavelength: 450,
        fwhm: 25,
        excitationWavelength: 375,
        temperature: 300,
        power: 10,
      },
      createdAt: new Date("2023-03-10T14:00:00").toISOString(),
      updatedAt: new Date("2023-03-10T14:00:00").toISOString(),
    },
  ]

  // Add temperature-dependent and power-dependent PL measurements for all samples
  const sampleIds = samples.map((s) => s.id)
  const powerValuesList = [1, 5, 10, 20, 50, 100]
  const temperatureValuesList = [10, 50, 100, 150, 200, 250, 300]

  sampleIds.forEach((sampleId) => {
    // Skip InGaN sample as it already has these measurements
    if (sampleId === "T250310InGaNA") return

    // Add power-dependent PL measurements
    powerValuesList.forEach((power, index) => {
      let peakWavelength = 365 // Default for GaN
      if (sampleId.includes("AlGaN")) peakWavelength = 340

      measurements.push({
        id: `${sampleId}${index + 10}pl_power`,
        sampleId: sampleId,
        name: `${sampleId}${index + 10}pl_power - PL at ${power}mW`,
        type: "pl",
        date: new Date(`2023-04-15T${10 + index}:00:00`).toISOString(),
        data: generatePowerDependentPLData(power),
        metadata: {
          peakWavelength,
          fwhm: 22 + (power > 50 ? 3 : 0), // Slight broadening at high power
          excitationWavelength: 325,
          temperature: 300,
          power: power,
          measurementType: "power-dependent",
        },
        createdAt: new Date(`2023-04-15T${10 + index}:00:00`).toISOString(),
        updatedAt: new Date(`2023-04-15T${10 + index}:00:00`).toISOString(),
      })
    })

    // Add temperature-dependent PL measurements
    temperatureValuesList.forEach((temperature, index) => {
      let peakWavelength = 365 // Default for GaN
      if (sampleId.includes("AlGaN")) peakWavelength = 340

      const redShift = temperature / 10 // Simulate red-shift with temperature

      measurements.push({
        id: `${sampleId}${index + 20}pl_temp`,
        sampleId: sampleId,
        name: `${sampleId}${index + 20}pl_temp - PL at ${temperature}K`,
        type: "pl",
        date: new Date(`2023-04-16T${10 + index}:00:00`).toISOString(),
        data: generateTemperatureDependentPLData(temperature),
        metadata: {
          peakWavelength: peakWavelength + redShift, // Red-shift with temperature
          fwhm: 15 + temperature / 10, // Broadening with temperature
          excitationWavelength: 325,
          temperature: temperature,
          power: 10,
          measurementType: "temperature-dependent",
        },
        createdAt: new Date(`2023-04-16T${10 + index}:00:00`).toISOString(),
        updatedAt: new Date(`2023-04-16T${10 + index}:00:00`).toISOString(),
      })
    })

    // Add electroluminescence measurements
    measurements.push({
      id: `${sampleId}30el`,
      sampleId: sampleId,
      name: `${sampleId}30el - EL Measurement`,
      type: "el",
      date: new Date("2023-04-20T14:00:00").toISOString(),
      data: generateELData(sampleId.includes("AlGaN") ? 340 : sampleId.includes("InGaN") ? 450 : 365),
      metadata: {
        peakWavelength: sampleId.includes("AlGaN") ? 340 : sampleId.includes("InGaN") ? 450 : 365,
        fwhm: 25,
        voltage: "3.5V",
        current: "20mA",
        temperature: 300,
      },
      createdAt: new Date("2023-04-20T14:00:00").toISOString(),
      updatedAt: new Date("2023-04-20T14:00:00").toISOString(),
    })

    // Add photoresponse measurements
    measurements.push({
      id: `${sampleId}40pr`,
      sampleId: sampleId,
      name: `${sampleId}40pr - Photoresponse Measurement`,
      type: "pr",
      date: new Date("2023-04-22T10:00:00").toISOString(),
      data: generatePhotoresponseData(sampleId.includes("AlGaN") ? 340 : sampleId.includes("InGaN") ? 450 : 365),
      metadata: {
        responsivityPeak: sampleId.includes("AlGaN") ? 340 : sampleId.includes("InGaN") ? 450 : 365,
        responsivityMax: 0.5,
        temperature: 300,
        biasVoltage: "0V",
      },
      createdAt: new Date("2023-04-22T10:00:00").toISOString(),
      updatedAt: new Date("2023-04-22T10:00:00").toISOString(),
    })
  })

  // Add power-dependent PL measurements for InGaN Sample A
  const powerValuesInGaN = [1, 5, 10, 20, 50, 100]

  powerValuesInGaN.forEach((power, index) => {
    measurements.push({
      id: `T250310InGaNA${index + 3}pl_power`,
      sampleId: "T250310InGaNA",
      name: `T250310InGaNA${index + 3}pl_power - PL at ${power}mW`,
      type: "pl",
      date: new Date(`2023-03-15T${10 + index}:00:00`).toISOString(),
      data: generatePowerDependentPLData(power),
      metadata: {
        peakWavelength: 450,
        fwhm: 22 + (power > 50 ? 3 : 0), // Slight broadening at high power
        excitationWavelength: 375,
        temperature: 300,
        power: power,
        measurementType: "power-dependent",
      },
      createdAt: new Date(`2023-03-15T${10 + index}:00:00`).toISOString(),
      updatedAt: new Date(`2023-03-15T${10 + index}:00:00`).toISOString(),
    })
  })

  // Add temperature-dependent PL measurements for InGaN Sample A
  const temperatureValuesInGaN = [10, 50, 100, 150, 200, 250, 300]

  temperatureValuesInGaN.forEach((temperature, index) => {
    measurements.push({
      id: `T250310InGaNA${index + 9}pl_temp`,
      sampleId: "T250310InGaNA",
      name: `T250310InGaNA${index + 9}pl_temp - PL at ${temperature}K`,
      type: "pl",
      date: new Date(`2023-03-16T${10 + index}:00:00`).toISOString(),
      data: generateTemperatureDependentPLData(temperature),
      metadata: {
        peakWavelength: 445 + temperature / 10, // Red-shift with temperature
        fwhm: 15 + temperature / 10, // Broadening with temperature
        excitationWavelength: 375,
        temperature: temperature,
        power: 10,
        measurementType: "temperature-dependent",
      },
      createdAt: new Date(`2023-03-16T${10 + index}:00:00`).toISOString(),
      updatedAt: new Date(`2023-03-16T${10 + index}:00:00`).toISOString(),
    })
  })

  const mbeRecipes: MBERecipe[] = [
    {
      id: "recipe-1",
      sampleId: "T250306GaNB",
      name: "T250306GaNB - GaN on Si MBE Recipe",
      description:
        "Standard recipe for GaN growth on Si by MBE\n\nLAYER STRUCTURE:\n100 Ang GaN cap\n3000 Ang Al0.3Ga0.7N barrier\n2000 Ang GaN buffer\nSi SUBSTRATE",
      growthParameters: {
        substrateTemperature: "750°C",
        galliumFlux: "5.2e-7 Torr",
        nitrogenFlow: "2.5 sccm",
        growthTime: "120 min",
        chamberPressure: "2.1e-5 Torr",
        layerStructure: "100 Ang GaN, 3000 Ang Al0.3Ga0.7N, 2000 Ang GaN, Si Substrate",
      },
      createdAt: new Date("2023-03-07").toISOString(),
      updatedAt: new Date("2023-03-07").toISOString(),
    },
    {
      id: "recipe-2",
      sampleId: "T250308AlGaN",
      name: "T250308AlGaN - AlGaN/GaN MOCVD Recipe",
      description:
        "Recipe for AlGaN/GaN heterostructure growth by MOCVD\n\nLAYER STRUCTURE:\n100 Ang GaN cap\n100 Ang AlN blocking layer\n3000 Ang Al0.3Ga0.7N barrier\n100 Ang GaN QW\n3000 Ang Al0.3Ga0.7N barrier\n100 Ang AlN blocking layer\n2000 Ang GaN buffer\nSapphire SUBSTRATE",
      growthParameters: {
        substrateTemperature: "1050°C",
        tMGa: "150 sccm",
        tMAl: "15 sccm",
        nh3Flow: "5000 sccm",
        growthTime: "90 min",
        reactorPressure: "100 Torr",
        layerStructure:
          "100 Ang GaN, 100 Ang AlN, 3000 Ang Al0.3Ga0.7N, 100 Ang GaN, 3000 Ang Al0.3Ga0.7N, 100 Ang AlN, 2000 Ang GaN, Sapphire Substrate",
      },
      createdAt: new Date("2023-03-08").toISOString(),
      updatedAt: new Date("2023-03-08").toISOString(),
    },
    {
      id: "recipe-3",
      sampleId: "T250310InGaNA",
      name: "T250310InGaNA - InGaN/GaN QW MOCVD Recipe",
      description:
        "Recipe for InGaN/GaN quantum well structure growth by MOCVD\n\nLAYER STRUCTURE:\n50 Ang GaN cap\n5x (30 Ang In0.15Ga0.85N QW / 100 Ang GaN barrier)\n2000 Ang GaN buffer\nSapphire SUBSTRATE",
      growthParameters: {
        substrateTemperature: "950°C",
        tMGa: "120 sccm",
        tMIn: "25 sccm",
        nh3Flow: "6000 sccm",
        growthTime: "110 min",
        reactorPressure: "120 Torr",
        layerStructure: "50 Ang GaN, 5x (30 Ang In0.15Ga0.85N / 100 Ang GaN), 2000 Ang GaN, Sapphire Substrate",
      },
      createdAt: new Date("2023-03-10").toISOString(),
      updatedAt: new Date("2023-03-10").toISOString(),
    },
    {
      id: "recipe-4",
      sampleId: "T250306GaNA",
      name: "T250306GaNA - GaN on Sapphire MOCVD Recipe",
      description:
        "Standard recipe for GaN growth on Sapphire by MOCVD\n\nLAYER STRUCTURE:\n100 Ang GaN cap\n2500 Ang GaN buffer\nSapphire SUBSTRATE",
      growthParameters: {
        substrateTemperature: "1050°C",
        tMGa: "140 sccm",
        nh3Flow: "5500 sccm",
        growthTime: "100 min",
        reactorPressure: "100 Torr",
        layerStructure: "100 Ang GaN, 2500 Ang GaN, Sapphire Substrate",
      },
      createdAt: new Date("2023-03-06").toISOString(),
      updatedAt: new Date("2023-03-06").toISOString(),
    },
  ]

  return { samples, measurements, mbeRecipes }
}

// Helper functions to generate data for visualizations
function generateXRDData() {
  const data = []
  for (let angle = 20; angle <= 80; angle += 0.5) {
    const intensity = 50 + Math.random() * 20

    // Add peaks at specific angles
    if (angle > 34 && angle < 35) {
      data.push({ angle, intensity: 1000 * Math.exp(-Math.pow((angle - 34.5) / 0.25, 2)) })
    } else if (angle > 72 && angle < 73) {
      data.push({ angle, intensity: 300 * Math.exp(-Math.pow((angle - 72.9) / 0.35, 2)) })
    } else {
      data.push({ angle, intensity })
    }
  }
  return data
}

function generatePLData() {
  const data = []
  for (let wavelength = 300; wavelength <= 600; wavelength += 2) {
    let intensity = 10 + Math.random() * 5

    // Add emission peak
    if (wavelength > 340 && wavelength < 390) {
      intensity += 800 * Math.exp(-Math.pow((wavelength - 365) / 15, 2))
    }

    data.push({ wavelength, intensity })
  }
  return data
}

// Generate electroluminescence (EL) data
function generateELData(peakWavelength = 500, fwhm = 25) {
  const data = []
  for (let wavelength = 300; wavelength <= 800; wavelength += 2) {
    let intensity = 10 + Math.random() * 5

    // Add emission peak
    intensity += 800 * Math.exp(-Math.pow((wavelength - peakWavelength) / fwhm, 2))

    data.push({ wavelength, intensity })
  }
  return data
}

// Generate photoresponse data
function generatePhotoresponseData(responsivityPeak = 450, responsivityWidth = 35) {
  const data = []
  for (let wavelength = 300; wavelength <= 800; wavelength += 2) {
    // Base responsivity with some noise
    let responsivity = 0.01 + Math.random() * 0.005

    // Add responsivity peak with a shape profile
    responsivity += 0.5 * Math.exp(-Math.pow((wavelength - responsivityPeak) / responsivityWidth, 2))

    data.push({ wavelength, responsivity })
  }
  return data
}

function generateHallData() {
  const data = []
  for (let bField = -2; bField <= 2; bField += 0.1) {
    const resistivity = 0.0095 + bField * 0.001 + Math.random() * 0.0005
    data.push({ bField, resistivity })
  }
  return data
}

// Generate power-dependent PL data
// Power dependence typically follows a power law: I ∝ P^k where k is between 1-2
function generatePowerDependentPLData(power: number) {
  const data = []
  const peakWavelength = 450 // nm
  const fwhm = 22 + (power > 50 ? 3 : 0) // Slight broadening at high power
  const k = 1.2 // Power law exponent (typically between 1-2 for QWs)

  // Calculate peak intensity based on power law
  const peakIntensity = 100 * Math.pow(power / 10, k)

  // Generate spectrum
  for (let wavelength = 350; wavelength <= 600; wavelength += 1) {
    // Base intensity with noise
    let intensity = 5 + Math.random() * 3

    // Add emission peak with Gaussian profile
    intensity += peakIntensity * Math.exp(-Math.pow((wavelength - peakWavelength) / (fwhm / 2.355), 2))

    data.push({ wavelength, intensity })
  }

  return data
}

// Generate temperature-dependent PL data
// Temperature dependence typically shows:
// 1. Peak red-shift with increasing temperature
// 2. Peak broadening with increasing temperature
// 3. Intensity decrease with increasing temperature (due to non-radiative recombination)
function generateTemperatureDependentPLData(temperature: number) {
  const data = []

  // Parameters that change with temperature
  const peakWavelength = 445 + temperature / 10 // Red-shift with temperature
  const fwhm = 15 + temperature / 10 // Broadening with temperature

  // Intensity decreases with temperature following Arrhenius behavior
  const activationEnergy = 50 // meV
  const kB = 0.0862 // Boltzmann constant in meV/K
  const intensityFactor = 1 / (1 + 10 * Math.exp(-activationEnergy / (kB * temperature)))
  const peakIntensity = 1000 * intensityFactor

  // Generate spectrum
  for (let wavelength = 350; wavelength <= 600; wavelength += 1) {
    // Base intensity with noise
    let intensity = 5 + Math.random() * 3

    // Add emission peak with Gaussian profile
    intensity += peakIntensity * Math.exp(-Math.pow((wavelength - peakWavelength) / (fwhm / 2.355), 2))

    data.push({ wavelength, intensity })
  }

  return data
}

// This is a utility function to generate mock measurement data
export function generateMockMeasurementData(measurementType: string, numPoints = 100) {
  // Default x range
  let xMin = 0
  let xMax = 100

  // Adjust x range based on measurement type
  switch (measurementType.toLowerCase()) {
    case "pl":
      // Photoluminescence typically uses wavelength in nm
      xMin = 400
      xMax = 800
      break
    case "el":
      // Electroluminescence typically uses wavelength in nm
      xMin = 400
      xMax = 800
      break
    case "iv":
      // Current-voltage typically uses voltage in V
      xMin = -2
      xMax = 2
      break
    case "eqe":
      // External quantum efficiency typically uses wavelength in nm
      xMin = 400
      xMax = 800
      break
    case "absorption":
      // Absorption typically uses wavelength in nm
      xMin = 300
      xMax = 800
      break
    case "temperature":
      // Temperature typically uses time in seconds
      xMin = 0
      xMax = 3600
      break
    default:
      // Default range
      xMin = 0
      xMax = 100
  }

  // Generate data points
  const data = []
  const xStep = (xMax - xMin) / numPoints

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * xStep
    let y

    // Generate y values based on measurement type
    switch (measurementType.toLowerCase()) {
      case "pl":
        // Photoluminescence typically has a Gaussian peak
        y = Math.exp(-Math.pow((x - 600) / 50, 2)) * (Math.random() * 0.2 + 0.9)
        break
      case "el":
        // Electroluminescence typically has a Gaussian peak
        y = Math.exp(-Math.pow((x - 550) / 40, 2)) * (Math.random() * 0.2 + 0.9)
        break
      case "iv":
        // Current-voltage typically has an exponential relationship
        y = Math.exp(x) - 1 + (Math.random() * 0.1 - 0.05)
        break
      case "eqe":
        // External quantum efficiency typically has a peak
        y = Math.exp(-Math.pow((x - 550) / 100, 2)) * (Math.random() * 0.2 + 0.9)
        break
      case "absorption":
        // Absorption typically increases with decreasing wavelength
        y = 2 - Math.exp(-Math.pow((800 - x) / 200, 2)) + (Math.random() * 0.1 - 0.05)
        break
      case "temperature":
        // Temperature typically follows an exponential decay or rise
        y = 20 + 5 * Math.exp(-x / 1000) + (Math.random() * 0.5 - 0.25)
        break
      default:
        // Default is a sine wave with noise
        y = Math.sin(x / 10) + (Math.random() * 0.2 - 0.1)
    }

    // Add data point
    data.push({
      wavelength: x,
      intensity: y,
    })
  }

  return data
}

