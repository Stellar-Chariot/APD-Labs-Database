/**
 * Service for processing measurement data.
 * This separates data processing logic from data fetching.
 */

import type { Measurement, DataPoint } from "@/types/measurement-types"
import { measurementService } from "../api/measurement-service"

export class MeasurementProcessor {
  // Process raw measurement data into a standardized format
  async processRawData(measurementId: string): Promise<DataPoint[]> {
    // Fetch the measurement
    const measurement = await measurementService.getMeasurement(measurementId)

    // Get or generate the raw data
    const rawData = await this.getRawData(measurement)

    // Process the data based on measurement type
    return this.processDataByType(rawData, measurement)
  }

  // Get raw data from files or generate mock data
  private async getRawData(measurement: Measurement): Promise<any[]> {
    // In a real implementation, this would parse files or fetch from a data store
    // For now, we'll generate mock data
    return this.generateMockData(measurement)
  }

  // Generate mock data for demonstration
  private generateMockData(measurement: Measurement): any[] {
    const { wavelengthStart, wavelengthEnd, resolution } = measurement.parameters
    const data: any[] = []

    // Different peak parameters based on measurement type
    let peaks: { center: number; height: number; width: number }[] = []

    if (measurement.measurementType === "UV_PL") {
      peaks = [
        { center: 720, height: 100, width: 15 },
        { center: 680, height: 30, width: 10 },
      ]
    } else if (measurement.measurementType === "UV_PR") {
      peaks = [
        { center: 700, height: -50, width: 8 },
        { center: 650, height: 70, width: 12 },
      ]
    } else if (measurement.measurementType === "IR_PL") {
      peaks = [
        { center: 950, height: 80, width: 25 },
        { center: 1050, height: 40, width: 20 },
      ]
    }

    for (let x = wavelengthStart; x <= wavelengthEnd; x += resolution) {
      // Calculate intensity from all peaks
      let intensity = 0
      for (const peak of peaks) {
        intensity += this.generateGaussianPeak(x, peak.center, peak.height, peak.width)
      }

      // Add some random noise
      const noise = Math.random() * 5
      intensity += noise

      // Ensure intensity is positive (for PL)
      if (measurement.measurementType.includes("PL")) {
        intensity = Math.max(0, intensity)
      }

      data.push({
        wavelength: x,
        intensity,
        raw: intensity,
      })
    }

    return data
  }

  // Generate a Gaussian peak
  private generateGaussianPeak(x: number, center: number, height: number, width: number): number {
    return height * Math.exp(-Math.pow((x - center) / width, 2))
  }

  // Process data based on measurement type
  private processDataByType(rawData: any[], measurement: Measurement): DataPoint[] {
    // Apply type-specific processing
    const processedData = [...rawData]

    // Find the maximum intensity for normalization
    const maxIntensity = Math.max(...processedData.map((point) => point.intensity))

    // Create standardized data points
    return processedData.map((point) => ({
      wavelength: point.wavelength,
      intensity: point.intensity,
      normalized: point.intensity / maxIntensity,
      raw: point.raw,
    }))
  }

  // Apply smoothing to data
  smoothData(data: DataPoint[], windowSize = 5): DataPoint[] {
    if (windowSize < 2) return data

    const smoothed = [...data]
    const halfWindow = Math.floor(windowSize / 2)

    for (let i = 0; i < data.length; i++) {
      let sum = 0
      let count = 0

      for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
        sum += data[j].intensity
        count++
      }

      smoothed[i] = {
        ...data[i],
        intensity: sum / count,
        normalized: sum / count / Math.max(...data.map((d) => d.intensity)),
      }
    }

    return smoothed
  }

  // Find peaks in the data
  findPeaks(data: DataPoint[], threshold = 0.5): DataPoint[] {
    const peaks: DataPoint[] = []

    for (let i = 1; i < data.length - 1; i++) {
      if (
        data[i].intensity > data[i - 1].intensity &&
        data[i].intensity > data[i + 1].intensity &&
        data[i].normalized > threshold
      ) {
        peaks.push(data[i])
      }
    }

    return peaks
  }
}

// Export a singleton instance
export const measurementProcessor = new MeasurementProcessor()

