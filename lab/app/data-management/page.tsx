import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MeasurementExportImport from "@/components/measurement-export-import"

export default function DataManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">Import, export, and manage your scientific data</p>
      </div>

      <Tabs defaultValue="export-import">
        <TabsList>
          <TabsTrigger value="export-import">Export & Import</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="export-import" className="space-y-4">
          <MeasurementExportImport />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Create and restore system backups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Backup and restore functionality would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Archive</CardTitle>
              <CardDescription>Archive and retrieve historical data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data archiving functionality would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

