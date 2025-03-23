"use client"

import { useState, useEffect } from "react"
import type {
  Measurement,
  MeasurementFormErrors,
  MeasurementFormState,
  MeasurementParameter,
  MeasurementType,
  MeasurementTypeId,
  Sample,
} from "@/types/measurement-types"
import { measurementService } from "@/services/measurement-service"
import { toast } from "sonner"

export function useMeasurementForm(initialSampleId?: string) {
  // Form state
  const [formState, setFormState] = useState<MeasurementFormState>({
    title: "",
    measurementType: "",
    description: "",
    sampleId: initialSampleId || "",
    parameters: {},
    files: [],
    notes: "",
    tags: [],
  })

  // Form metadata
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([])
  const [parameters, setParameters] = useState<MeasurementParameter[]>([])
  const [samples, setSamples] = useState<Sample[]>([])

  // Form status
  const [errors, setErrors] = useState<MeasurementFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true)
      try {
        const [types, samplesData] = await Promise.all([
          measurementService.getMeasurementTypes(),
          measurementService.getSamples(),
        ])

        setMeasurementTypes(types)
        setSamples(samplesData)
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast.error("Failed to load form data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Load parameters when measurement type changes
  useEffect(() => {
    async function loadParameters() {
      if (!formState.measurementType) {
        setParameters([])
        return
      }

      try {
        const params = await measurementService.getMeasurementParameters(formState.measurementType as MeasurementTypeId)

        setParameters(params)

        // Initialize parameters with default values
        const measurementType = measurementTypes.find((t) => t.id === formState.measurementType)
        if (measurementType) {
          setFormState((prev) => ({
            ...prev,
            parameters: { ...measurementType.defaultParameters },
          }))
        }
      } catch (error) {
        console.error("Error loading parameters:", error)
        toast.error("Failed to load measurement parameters.")
      }
    }

    loadParameters()
  }, [formState.measurementType, measurementTypes])

  // Handle form field changes
  const handleChange = (field: keyof MeasurementFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof MeasurementFormErrors]
        return newErrors
      })
    }
  }

  // Handle parameter changes
  const handleParameterChange = (paramName: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value,
      },
    }))

    // Clear error for this parameter
    if (errors.parameters && errors.parameters[paramName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        if (newErrors.parameters) {
          const paramErrors = { ...newErrors.parameters }
          delete paramErrors[paramName]
          newErrors.parameters = paramErrors
        }
        return newErrors
      })
    }
  }

  // Handle file uploads
  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      localFile: file,
      status: "pending" as const,
      uploadProgress: 0,
    }))

    setFormState((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }))

    // Clear file error if it exists
    if (errors.files) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.files
        return newErrors
      })
    }
  }

  // Remove a file
  const handleRemoveFile = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: MeasurementFormErrors = {}

    // Required fields
    if (!formState.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formState.measurementType) {
      newErrors.measurementType = "Measurement type is required"
    }

    if (!formState.sampleId) {
      newErrors.sampleId = "Sample is required"
    }

    // Parameter validation
    const measurementType = measurementTypes.find((t) => t.id === formState.measurementType)
    if (measurementType) {
      const paramErrors: Record<string, string> = {}

      measurementType.requiredParameters.forEach((paramName) => {
        if (formState.parameters[paramName] === undefined || formState.parameters[paramName] === "") {
          paramErrors[paramName] = "This parameter is required"
        }
      })

      if (Object.keys(paramErrors).length > 0) {
        newErrors.parameters = paramErrors
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit the form
  const handleSubmit = async (): Promise<Measurement | null> => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return null
    }

    setIsSubmitting(true)

    try {
      // Create the measurement
      const measurement: Measurement = {
        title: formState.title,
        measurementType: formState.measurementType as MeasurementTypeId,
        description: formState.description,
        sampleId: formState.sampleId,
        parameters: formState.parameters,
        notes: formState.notes,
        tags: formState.tags,
      }

      const createdMeasurement = await measurementService.createMeasurement(measurement)

      // Upload files if any
      if (formState.files.length > 0) {
        setIsUploading(true)

        const fileUploads = formState.files.map((file) => {
          if (file.localFile) {
            return measurementService.uploadFile(file.localFile, createdMeasurement.id!)
          }
          return Promise.resolve(file)
        })

        await Promise.all(fileUploads)
        setIsUploading(false)
      }

      toast.success("Measurement created successfully")
      return createdMeasurement
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to create measurement. Please try again.")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formState,
    measurementTypes,
    parameters,
    samples,
    errors,
    isSubmitting,
    isLoading,
    isUploading,
    handleChange,
    handleParameterChange,
    handleFileUpload,
    handleRemoveFile,
    handleSubmit,
  }
}

