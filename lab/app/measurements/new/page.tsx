"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, FileUp, Save, Upload } from "lucide-react"

// Implement the form directly in the page component to eliminate potential import issues
export default function NewMeasurementPage() {
  const router = useRouter()
  const [entryMethod, setEntryMethod] = useState<"import" | "manual">("import")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [csvText, setCsvText] = useState("")

  // Handle cancel
  const handleCancel = () => {
    router.push("/measurements")
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("This is a demo - measurement would be created here")
    router.push("/measurements")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Measurement</h1>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button type="button" variant="outline" size="icon" onClick={handleCancel} className="mr-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">New Measurement</CardTitle>
              <CardDescription>Import a document or manually enter measurement data</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Measurement Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a brief description of this measurement"
                  rows={3}
                />
              </div>

              {/* Entry Method Tabs */}
              <Tabs
                value={entryMethod}
                onValueChange={(v) => setEntryMethod(v as "import" | "manual")}
                className="mt-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="import">Import Document</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                {/* Import Document Tab */}
                <TabsContent value="import" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Import Measurement Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload data files for this measurement</p>

                    <Button type="button" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                </TabsContent>

                {/* Manual Entry Tab */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-input">Paste CSV Data</Label>
                    <Textarea
                      id="csv-input"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="Paste your CSV data here (comma-separated values)..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Create Measurement
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

