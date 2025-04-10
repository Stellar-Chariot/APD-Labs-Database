import type React from "react"

interface Measurement {
  id: number
  value: number
  unit: string
  measurement_date: string // Assuming date is stored as a string
  device_id: number
}

interface MeasurementsTableProps {
  measurements: Measurement[]
}

const MeasurementsTable: React.FC<MeasurementsTableProps> = ({ measurements }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Value</th>
          <th>Unit</th>
          <th>Measurement Date</th>
          <th>Device ID</th>
        </tr>
      </thead>
      <tbody>
        {measurements.map((measurement) => (
          <tr key={measurement.id}>
            <td>{measurement.id}</td>
            <td>{measurement.value}</td>
            <td>{measurement.unit}</td>
            <td>{new Date(measurement.measurement_date).toLocaleDateString()}</td>
            <td>{measurement.device_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MeasurementsTable
