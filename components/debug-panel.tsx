"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, ChevronUp, ChevronDown } from "lucide-react"

interface DebugPanelProps {
  data: any
  title?: string
}

export function DebugPanel({ data, title = "Debug Information" }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Helper to determine if a value should be expandable
  const isExpandable = (value: any) => {
    return value !== null && typeof value === "object"
  }

  // Toggle a specific section
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Render a value with potential expansion
  const renderValue = (key: string, value: any, depth = 0): JSX.Element => {
    if (!isExpandable(value)) {
      return <span className="text-xs">{String(value)}</span>
    }

    const isExpanded = expandedSections[key] || false
    const prefix = depth > 0 ? Array(depth).fill("  ").join("") : ""

    return (
      <div>
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
          onClick={() => toggleSection(key)}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronUp className="h-3 w-3 mr-1" />}
          <span className="text-xs font-medium">
            {prefix}
            {key}:{" "}
          </span>
          <span className="text-xs ml-1 text-gray-500">
            {Array.isArray(value) ? `Array(${value.length})` : `Object(${Object.keys(value).length} props)`}
          </span>
        </div>

        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
            {Array.isArray(value)
              ? value.slice(0, 10).map((item, i) => (
                  <div key={i} className="my-1">
                    {renderValue(`${key}[${i}]`, item, depth + 1)}
                  </div>
                ))
              : Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="my-1">
                    {isExpandable(subValue) ? (
                      renderValue(`${subKey}`, subValue, depth + 1)
                    ) : (
                      <div className="text-xs">
                        <span className="font-medium">
                          {prefix} {subKey}:
                        </span>{" "}
                        {String(subValue)}
                      </div>
                    )}
                  </div>
                ))}
            {Array.isArray(value) && value.length > 10 && (
              <div className="text-xs text-gray-500 italic">...{value.length - 10} more items</div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="bg-background shadow-md">
        <Code className="mr-2 h-4 w-4" />
        {isOpen ? "Hide Debug" : "Show Debug"}
      </Button>

      {isOpen && (
        <Card className="mt-2 w-[500px] max-h-[400px] overflow-auto shadow-lg">
          <CardHeader className="py-2">
            <CardTitle className="text-sm">{title}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="border-b border-gray-100 dark:border-gray-800 pb-2">
                  {renderValue(key, value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

