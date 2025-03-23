"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { MeasurementParameter } from "@/types/measurement-types"

interface ParameterFieldProps {
  parameter: MeasurementParameter
  value: any
  onChange: (name: string, value: any) => void
  error?: string
}

export function ParameterField({ parameter, value, onChange, error }: ParameterFieldProps) {
  const handleChange = (val: any) => {
    onChange(parameter.name, val)
  }

  switch (parameter.type) {
    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={parameter.id} className="flex items-center justify-between">
            {parameter.label}
            {parameter.unit && <span className="text-xs text-muted-foreground">({parameter.unit})</span>}
          </Label>
          <Input
            id={parameter.id}
            type="number"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            value={value ?? parameter.defaultValue ?? ""}
            onChange={(e) => handleChange(e.target.valueAsNumber || "")}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
        </div>
      )

    case "text":
      return (
        <div className="space-y-2">
          <Label htmlFor={parameter.id}>{parameter.label}</Label>
          <Input
            id={parameter.id}
            type="text"
            value={value ?? parameter.defaultValue ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={parameter.id}>{parameter.label}</Label>
          <Select value={value ?? parameter.defaultValue ?? ""} onValueChange={handleChange}>
            <SelectTrigger id={parameter.id} className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={`Select ${parameter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {parameter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
        </div>
      )

    case "slider":
      return (
        <div className="space-y-2">
          <Label htmlFor={parameter.id} className="flex items-center justify-between">
            {parameter.label}
            <span className="text-sm font-normal">
              {value ?? parameter.defaultValue ?? parameter.min} {parameter.unit}
            </span>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id={parameter.id}
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              value={[value ?? parameter.defaultValue ?? parameter.min]}
              onValueChange={(vals) => handleChange(vals[0])}
              className="flex-1"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center justify-between space-x-2">
          <div>
            <Label htmlFor={parameter.id}>{parameter.label}</Label>
            {parameter.description && <p className="text-xs text-muted-foreground">{parameter.description}</p>}
          </div>
          <Switch id={parameter.id} checked={value ?? parameter.defaultValue ?? false} onCheckedChange={handleChange} />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    default:
      return null
  }
}

