"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    defaultDashboardView: "recent",
    defaultSampleSort: "date-desc",
    itemsPerPage: "10",
    dateFormat: "mm-dd-yyyy",
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    compactMode: false,
    sidebarCollapsed: false,
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewSample: true,
    emailNewMeasurement: true,
    emailProcessingComplete: true,
    inAppNotifications: true,
    notificationSound: false,
  })

  // Advanced settings
  const [advancedSettings, setAdvearanceSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    apiAccess: false,
    dataExport: false,
    debugMode: false,
    experimentalFeatures: false,
  })

  const handleSaveGeneralSettings = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("General settings saved")
    }, 1000)
  }

  const handleSaveAppearance = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Appearance settings saved")

      // Apply theme
      if (appearanceSettings.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (appearanceSettings.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // System theme
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Notification settings saved")
    }, 1000)
  }

  const handleSaveAdvancedSettings = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Advanced settings saved")
    }, 1000)
  }

  const handleResetToDefaults = () => {
    // Reset advanced settings
    setAdvearanceSettings({
      autoBackup: true,
      backupFrequency: "daily",
      apiAccess: false,
      dataExport: false,
      debugMode: false,
      experimentalFeatures: false,
    })

    toast.success("Settings reset to defaults")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Views</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDashboardView">Default Dashboard View</Label>
                    <Select
                      value={generalSettings.defaultDashboardView}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultDashboardView: value })}
                    >
                      <SelectTrigger id="defaultDashboardView">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recent Activity</SelectItem>
                        <SelectItem value="samples">Recent Samples</SelectItem>
                        <SelectItem value="relationships">Data Relationships</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultSampleSort">Default Sample Sorting</Label>
                    <Select
                      value={generalSettings.defaultSampleSort}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultSampleSort: value })}
                    >
                      <SelectTrigger id="defaultSampleSort">
                        <SelectValue placeholder="Select default sorting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                        <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Display</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="itemsPerPage">Items Per Page</Label>
                      <p className="text-sm text-muted-foreground">Number of items to display in lists</p>
                    </div>
                    <Select
                      value={generalSettings.itemsPerPage}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, itemsPerPage: value })}
                    >
                      <SelectTrigger id="itemsPerPage" className="w-20">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <p className="text-sm text-muted-foreground">How dates are displayed</p>
                    </div>
                    <Select
                      value={generalSettings.dateFormat}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}
                    >
                      <SelectTrigger id="dateFormat" className="w-40">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneralSettings} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-full rounded-md bg-white border border-gray-200 flex items-center justify-center">
                      <span className="text-black">Light</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="theme-light"
                        name="theme"
                        className="rounded-full"
                        checked={appearanceSettings.theme === "light"}
                        onChange={() => setAppearanceSettings({ ...appearanceSettings, theme: "light" })}
                      />
                      <Label htmlFor="theme-light">Light</Label>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-full rounded-md bg-gray-900 border border-gray-700 flex items-center justify-center">
                      <span className="text-white">Dark</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="theme-dark"
                        name="theme"
                        className="rounded-full"
                        checked={appearanceSettings.theme === "dark"}
                        onChange={() => setAppearanceSettings({ ...appearanceSettings, theme: "dark" })}
                      />
                      <Label htmlFor="theme-dark">Dark</Label>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-full rounded-md bg-gradient-to-r from-white to-gray-900 border border-gray-300 flex items-center justify-center">
                      <span>System</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="theme-system"
                        name="theme"
                        className="rounded-full"
                        checked={appearanceSettings.theme === "system"}
                        onChange={() => setAppearanceSettings({ ...appearanceSettings, theme: "system" })}
                      />
                      <Label htmlFor="theme-system">System</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactMode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use more condensed UI elements</p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) =>
                        setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebarCollapsed">Collapsed Sidebar by Default</Label>
                      <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                    </div>
                    <Switch
                      id="sidebarCollapsed"
                      checked={appearanceSettings.sidebarCollapsed}
                      onCheckedChange={(checked) =>
                        setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAppearance} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Appearance"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNewSample">New Sample Created</Label>
                      <p className="text-sm text-muted-foreground">Receive email when a new sample is added</p>
                    </div>
                    <Switch
                      id="emailNewSample"
                      checked={notificationSettings.emailNewSample}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNewSample: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNewMeasurement">New Measurement Added</Label>
                      <p className="text-sm text-muted-foreground">Receive email when a new measurement is added</p>
                    </div>
                    <Switch
                      id="emailNewMeasurement"
                      checked={notificationSettings.emailNewMeasurement}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNewMeasurement: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailProcessingComplete">Processing Complete</Label>
                      <p className="text-sm text-muted-foreground">Receive email when data processing is complete</p>
                    </div>
                    <Switch
                      id="emailProcessingComplete"
                      checked={notificationSettings.emailProcessingComplete}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailProcessingComplete: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="inAppNotifications">Enable In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                    </div>
                    <Switch
                      id="inAppNotifications"
                      checked={notificationSettings.inAppNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, inAppNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notificationSound">Notification Sound</Label>
                      <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                    </div>
                    <Switch
                      id="notificationSound"
                      checked={notificationSettings.notificationSound}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, notificationSound: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Notification Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBackup">Automatic Data Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                    </div>
                    <Switch
                      id="autoBackup"
                      checked={advancedSettings.autoBackup}
                      onCheckedChange={(checked) => setAdvearanceSettings({ ...advancedSettings, autoBackup: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={advancedSettings.backupFrequency}
                      onValueChange={(value) => setAdvearanceSettings({ ...advancedSettings, backupFrequency: value })}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Integration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="apiAccess">Enable API Access</Label>
                      <p className="text-sm text-muted-foreground">Allow external systems to access data via API</p>
                    </div>
                    <Switch
                      id="apiAccess"
                      checked={advancedSettings.apiAccess}
                      onCheckedChange={(checked) => setAdvearanceSettings({ ...advancedSettings, apiAccess: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataExport">Automatic Data Export</Label>
                      <p className="text-sm text-muted-foreground">Automatically export data to connected systems</p>
                    </div>
                    <Switch
                      id="dataExport"
                      checked={advancedSettings.dataExport}
                      onCheckedChange={(checked) => setAdvearanceSettings({ ...advancedSettings, dataExport: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Developer Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
                    </div>
                    <Switch
                      id="debugMode"
                      checked={advancedSettings.debugMode}
                      onCheckedChange={(checked) => setAdvearanceSettings({ ...advancedSettings, debugMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="experimentalFeatures">Experimental Features</Label>
                      <p className="text-sm text-muted-foreground">Enable experimental features and functionality</p>
                    </div>
                    <Switch
                      id="experimentalFeatures"
                      checked={advancedSettings.experimentalFeatures}
                      onCheckedChange={(checked) =>
                        setAdvearanceSettings({ ...advancedSettings, experimentalFeatures: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleResetToDefaults}>
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveAdvancedSettings} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Advanced Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

