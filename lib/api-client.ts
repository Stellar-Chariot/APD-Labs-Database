import type { ApiClient, ApiError, ApiRequestOptions } from "@/types/api"

// Import the simulatedBackend
import { simulatedBackend } from "@/lib/simulated-backend"

// Default request options
const DEFAULT_OPTIONS: ApiRequestOptions = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds
  retries: 1,
  cache: "default",
}

// Create a custom error class for API errors
export class ApiRequestError extends Error implements ApiError {
  status?: number
  code?: string
  errors?: Record<string, string[]>
  originalError?: unknown

  constructor(message: string, options: Partial<ApiError> = {}) {
    super(message)
    this.name = "ApiRequestError"
    this.status = options.status
    this.code = options.code
    this.errors = options.errors
    this.originalError = options.originalError
  }
}

// API client implementation
export class HttpClient implements ApiClient {
  private baseUrl: string
  private defaultOptions: ApiRequestOptions
  private requestInterceptors: Array<(request: Request) => Request | Promise<Request>>
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>>
  private errorInterceptors: Array<(error: ApiError) => ApiError | Promise<ApiError>>

  constructor(baseUrl = "", options: ApiRequestOptions = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = { ...DEFAULT_OPTIONS, ...options }
    this.requestInterceptors = []
    this.responseInterceptors = []
    this.errorInterceptors = []
  }

  // Add a request interceptor
  addRequestInterceptor(interceptor: (request: Request) => Request | Promise<Request>) {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1)
      }
    }
  }

  // Add a response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor)
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor)
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1)
      }
    }
  }

  // Add an error interceptor
  addErrorInterceptor(interceptor: (error: ApiError) => ApiError | Promise<ApiError>) {
    this.errorInterceptors.push(interceptor)
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor)
      if (index !== -1) {
        this.errorInterceptors.splice(index, 1)
      }
    }
  }

  // Build the full URL with query parameters
  private buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url

    if (!params) {
      return fullUrl
    }

    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    return queryString ? `${fullUrl}?${queryString}` : fullUrl
  }

  // Apply request interceptors
  private async applyRequestInterceptors(request: Request): Promise<Request> {
    let interceptedRequest = request
    for (const interceptor of this.requestInterceptors) {
      interceptedRequest = await interceptor(interceptedRequest)
    }
    return interceptedRequest
  }

  // Apply response interceptors
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let interceptedResponse = response
    for (const interceptor of this.responseInterceptors) {
      interceptedResponse = await interceptor(interceptedResponse)
    }
    return interceptedResponse
  }

  // Apply error interceptors
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let interceptedError = error
    for (const interceptor of this.errorInterceptors) {
      interceptedError = await interceptor(interceptedError)
    }
    return interceptedError
  }

  // Process the response
  private async processResponse<T>(response: Response): Promise<T> {
    // Apply response interceptors
    response = await this.applyResponseInterceptors(response)

    // Check if the response is OK
    if (!response.ok) {
      let errorData: any = {}

      try {
        // Try to parse the error response as JSON
        errorData = await response.json()
      } catch (e) {
        // If parsing fails, use the status text
        errorData = { message: response.statusText }
      }

      // Create an API error
      const apiError: ApiError = {
        message: errorData.message || `Request failed with status ${response.status}`,
        status: response.status,
        code: errorData.code,
        errors: errorData.errors,
      }

      // Apply error interceptors
      const interceptedError = await this.applyErrorInterceptors(apiError)

      // Throw the error
      throw new ApiRequestError(interceptedError.message, interceptedError)
    }

    // Parse the response
    if (response.status === 204) {
      // No content
      return {} as T
    }

    // For our simulated backend, we need to handle the special case
    // where the response is already an object with a data property
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json()

      // Check if the response has a data property (simulated backend format)
      if (jsonData && typeof jsonData === "object" && "data" in jsonData) {
        return jsonData.data as T
      }

      return jsonData as T
    }

    // For non-JSON responses
    const text = await response.text()
    try {
      return JSON.parse(text) as T
    } catch (e) {
      return text as unknown as T
    }
  }

  // Make a request with retry logic
  private async makeRequest<T>(method: string, url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const { headers, params, timeout, retries = 1, cache, signal } = mergedOptions

    // Build the full URL
    const fullUrl = this.buildUrl(url, params)

    // Create the request init
    const requestInit: RequestInit = {
      method,
      headers: { ...this.defaultOptions.headers, ...headers },
      cache,
      signal,
    }

    // Add body for POST, PUT, PATCH requests
    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      requestInit.body = JSON.stringify(data)
    }

    // Create the request
    let request = new Request(fullUrl, requestInit)

    // Apply request interceptors
    request = await this.applyRequestInterceptors(request)

    // Create a timeout controller if needed
    let timeoutId: NodeJS.Timeout | undefined
    let timeoutController: AbortController | undefined

    if (timeout && !signal) {
      timeoutController = new AbortController()
      request = new Request(request, {
        signal: timeoutController.signal,
      })

      timeoutId = setTimeout(() => {
        timeoutController?.abort()
      }, timeout)
    }

    // Make the request with retry logic
    let lastError: unknown
    let retriesLeft = retries

    while (retriesLeft >= 0) {
      try {
        const response = await fetch(request.clone())

        // Clear the timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Process the response
        return await this.processResponse<T>(response)
      } catch (error) {
        lastError = error

        // Don't retry if the request was aborted
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new ApiRequestError("Request timed out", {
            status: 408,
            code: "TIMEOUT",
            originalError: error,
          })
        }

        // Don't retry if we're out of retries
        if (retriesLeft <= 0) {
          break
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retries - retriesLeft) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))

        retriesLeft--
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof ApiRequestError) {
      throw lastError
    }

    throw new ApiRequestError("Request failed", {
      originalError: lastError,
    })
  }

  // HTTP methods
  async get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>("GET", url, undefined, options)
  }

  async post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>("POST", url, data, options)
  }

  async put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>("PUT", url, data, options)
  }

  async delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>("DELETE", url, undefined, options)
  }

  async request<T>(method: string, url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>(method, url, data, options)
  }
}

// Create a singleton instance for the simulated backend
export const apiClient = new HttpClient()

// Add this function if it doesn't already exist
export async function fetchMeasurementTypes() {
  try {
    // In a real app, this might be its own endpoint
    // Here we'll get all measurements and extract unique types
    const measurements = await simulatedBackend.getAllMeasurements()

    // Ensure measurements is an array
    if (!Array.isArray(measurements)) {
      console.warn("fetchMeasurementTypes: Expected array of measurements but got:", measurements)
      return []
    }

    // Extract unique measurement types from the measurements data
    const typeMap = new Map()
    measurements.forEach((measurement) => {
      if (measurement && measurement.type && !typeMap.has(measurement.type)) {
        typeMap.set(measurement.type, {
          id: measurement.type,
          name: formatMeasurementTypeName(measurement.type),
        })
      }
    })

    return Array.from(typeMap.values())
  } catch (error) {
    console.error("Error fetching measurement types:", error)
    return []
  }
}

// Helper function to format measurement type names
function formatMeasurementTypeName(type: string): string {
  // Map of type codes to full names
  const typeNames: Record<string, string> = {
    xrd: "X-Ray Diffraction (XRD)",
    sem: "Scanning Electron Microscopy (SEM)",
    xps: "X-ray Photoelectron Spectroscopy (XPS)",
    ftir: "Fourier Transform Infrared Spectroscopy (FTIR)",
    "uv-vis": "UV-Visible Spectroscopy",
    raman: "Raman Spectroscopy",
    tga: "Thermogravimetric Analysis (TGA)",
    dsc: "Differential Scanning Calorimetry (DSC)",
  }

  return typeNames[type] || type
}

// Add the fetchSamples function after the fetchMeasurementTypes function
// Fetch all measurements with optional filtering
export async function fetchMeasurements({ sampleId = null, type = null } = {}) {
  try {
    console.log("Fetching measurements with filters:", { sampleId, type })

    // Get all measurements from the simulated backend - using the correct method name
    const measurements = await simulatedBackend.getAllMeasurements()
    console.log(`Received ${measurements.length} measurements from backend`)

    // Ensure measurements is an array
    if (!Array.isArray(measurements)) {
      console.warn("fetchMeasurements: Expected array but got:", measurements)
      return []
    }

    // Apply filters if provided
    let filteredMeasurements = [...measurements] // Create a copy to avoid mutating the original

    if (sampleId) {
      console.log("Filtering by sampleId:", sampleId)
      filteredMeasurements = filteredMeasurements.filter((m) => m.sampleId === sampleId)
      console.log(`After sample filter: ${filteredMeasurements.length} measurements`)
    }

    if (type) {
      console.log("Filtering by type:", type)
      filteredMeasurements = filteredMeasurements.filter((m) => m.type === type)
      console.log(`After type filter: ${filteredMeasurements.length} measurements`)
    }

    // Enhance measurements with sample information
    const enhancedMeasurements = await enhanceMeasurementsWithSampleInfo(filteredMeasurements)
    console.log(`Final filtered measurements: ${enhancedMeasurements.length}`)

    return enhancedMeasurements
  } catch (error) {
    console.error("Error fetching measurements:", error)
    return []
  }
}

// Helper function to add sample information to measurements
async function enhanceMeasurementsWithSampleInfo(measurements) {
  try {
    // Get all samples
    const samples = await simulatedBackend.getSamples()

    // Create a map of sample IDs to sample names for quick lookup
    const sampleMap = {}
    samples.forEach((sample) => {
      sampleMap[sample.id] = sample.name
    })

    // Add sample name to each measurement
    return measurements.map((measurement) => ({
      ...measurement,
      sampleName: sampleMap[measurement.sampleId] || measurement.sampleId,
    }))
  } catch (error) {
    console.error("Error enhancing measurements with sample info:", error)
    // Return the original measurements if there's an error
    return measurements
  }
}

// Fetch a single measurement by ID
export async function fetchMeasurement(id) {
  try {
    const measurement = await simulatedBackend.getMeasurement(id)

    // Enhance with sample information
    if (measurement && measurement.sampleId) {
      try {
        const sample = await simulatedBackend.getSample(measurement.sampleId)
        if (sample) {
          measurement.sampleName = sample.name
        }
      } catch (error) {
        console.error(`Error fetching sample for measurement ${id}:`, error)
      }
    }

    return measurement
  } catch (error) {
    console.error(`Error fetching measurement ${id}:`, error)
    throw error
  }
}

// Fetch all samples
export async function fetchSamples() {
  try {
    return await simulatedBackend.getSamples()
  } catch (error) {
    console.error("Error fetching samples:", error)
    throw error
  }
}

// Fetch a single sample by ID
export async function fetchSample(id) {
  try {
    return await simulatedBackend.getSample(id)
  } catch (error) {
    console.error(`Error fetching sample ${id}:`, error)
    throw error
  }
}

// Create a new measurement
export async function createMeasurement(measurementData) {
  try {
    return await simulatedBackend.createMeasurement(measurementData)
  } catch (error) {
    console.error("Error creating measurement:", error)
    throw error
  }
}

// Update an existing measurement
export async function updateMeasurement(id, measurementData) {
  try {
    return await simulatedBackend.updateMeasurement(id, measurementData)
  } catch (error) {
    console.error(`Error updating measurement ${id}:`, error)
    throw error
  }
}

// Delete a measurement
export async function deleteMeasurement(id) {
  try {
    return await simulatedBackend.deleteMeasurement(id)
  } catch (error) {
    console.error(`Error deleting measurement ${id}:`, error)
    throw error
  }
}

// Error categorization helper
export function categorizeError(error: unknown): {
  message: string
  code?: string
  status?: number
  isNetworkError: boolean
  isTimeoutError: boolean
  isServerError: boolean
  isClientError: boolean
  isAuthError: boolean
} {
  let message = "An unexpected error occurred"
  let code: string | undefined
  let status: number | undefined
  let isNetworkError = false
  let isTimeoutError = false
  let isServerError = false
  let isClientError = false
  let isAuthError = false

  if (error instanceof ApiRequestError) {
    message = error.message
    code = error.code
    status = error.status

    if (error.status) {
      isServerError = error.status >= 500 && error.status < 600
      isClientError = error.status >= 400 && error.status < 500
      isAuthError = error.status === 401 || error.status === 403
    }

    if (error.code === "TIMEOUT") {
      isTimeoutError = true
    }
  } else if (error instanceof Error) {
    message = error.message

    // Check for network errors
    if (
      error.message.includes("network") ||
      error.message.includes("Network") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed")
    ) {
      isNetworkError = true
    }
  }

  return {
    message,
    code,
    status,
    isNetworkError,
    isTimeoutError,
    isServerError,
    isClientError,
    isAuthError,
  }
}

// Add a global error handler to the API client
apiClient.addErrorInterceptor(async (error) => {
  const { isNetworkError, isTimeoutError, isServerError, isAuthError } = categorizeError(error)

  // Customize error messages based on error type
  if (isNetworkError) {
    error.message = "Network error: Please check your internet connection"
  } else if (isTimeoutError) {
    error.message = "Request timed out: The server took too long to respond"
  } else if (isServerError) {
    error.message = "Server error: Our servers are experiencing issues"
  } else if (isAuthError) {
    error.message = "Authentication error: Please log in again"
    // Here you could also redirect to login or refresh tokens
  }

  return error
})

// Add a request interceptor for logging in development
if (process.env.NODE_ENV === "development") {
  apiClient.addRequestInterceptor((request) => {
    console.log(`🚀 ${request.method} ${request.url}`)
    return request
  })
}

// Add a response interceptor for logging in development
if (process.env.NODE_ENV === "development") {
  apiClient.addResponseInterceptor(async (response) => {
    const clonedResponse = response.clone()
    const contentType = clonedResponse.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await clonedResponse.json()
        console.log(`✅ ${response.status} ${response.url}`, data)
      } catch (e) {
        console.log(`✅ ${response.status} ${response.url}`)
      }
    } else {
      console.log(`✅ ${response.status} ${response.url}`)
    }

    return response
  })
}

// Add an error interceptor for logging in development
if (process.env.NODE_ENV === "development") {
  apiClient.addErrorInterceptor((error) => {
    console.error(`❌ API Error: ${error.message}`, error)
    return error
  })
}

