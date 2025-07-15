"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Users, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { Table } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  type TableStatus = "free" | "serving" | "completed"
  const [formData, setFormData] = useState<{ table_number: string; status: TableStatus }>({
    table_number: "",
    status: "free",
  })
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchTables()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "staff"].includes(userData.role)) {
      router.push("/admin/dashboard")
    }
  }

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from("tables").select("*").order("table_number")

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      table_number: "",
      status: "free",
    })
    setSelectedTable(null)
    setIsEditing(false)
  }

  const handleEdit = (table: Table) => {
    setSelectedTable(table)
    setFormData({
      table_number: table.table_number.toString(),
      status: table.status,
    })
    setIsEditing(true)
  }

  const getNextTableNumber = () => {
    if (tables.length === 0) return 1
    const maxTableNumber = Math.max(...tables.map((t) => t.table_number))
    return maxTableNumber + 1
  }

  const handleSave = async () => {
    const tableNumber = Number.parseInt(formData.table_number)

    if (!tableNumber || tableNumber <= 0) {
      toast({
        title: "Validation error",
        description: "Please enter a valid table number.",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate table numbers (except when editing the same table)
    const existingTable = tables.find((t) => t.table_number === tableNumber)
    if (existingTable && (!isEditing || existingTable.id !== selectedTable?.id)) {
      toast({
        title: "Duplicate table number",
        description: "A table with this number already exists.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const tableData = {
        table_number: tableNumber,
        status: formData.status,
      }

      if (isEditing && selectedTable) {
        const { error } = await supabase.from("tables").update(tableData).eq("id", selectedTable.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("tables").insert(tableData)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Table ${isEditing ? "updated" : "created"} successfully.`,
      })

      resetForm()
      fetchTables()
    } catch (error: any) {
      console.error("Error saving table:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save table. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (table: Table) => {
    if (!confirm(`Are you sure you want to delete Table #${table.table_number}?`)) return

    try {
      const { error } = await supabase.from("tables").delete().eq("id", table.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Table deleted successfully.",
      })

      fetchTables()
    } catch (error) {
      console.error("Error deleting table:", error)
      toast({
        title: "Error",
        description: "Failed to delete table. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTableStatus = async (table: Table, newStatus: Table["status"]) => {
    try {
      const { error } = await supabase.from("tables").update({ status: newStatus }).eq("id", table.id)

      if (error) throw error

      fetchTables()
      toast({
        title: "Status updated",
        description: `Table #${table.table_number} status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating table status:", error)
      toast({
        title: "Error",
        description: "Failed to update table status.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-100 text-green-800"
      case "serving":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <Users className="h-4 w-4" />
      case "serving":
        return <Clock className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4 opacity-50" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-2 xs:p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 xs:gap-4 mb-6 w-full">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold truncate">Table Management</h1>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base truncate">Manage restaurant tables and their status</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setFormData((prev) => ({ ...prev, table_number: getNextTableNumber().toString() }))
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full xs:max-w-xl sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Table" : "Add New Table"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="table_number">Table Number *</Label>
                  <Input
                    id="table_number"
                    type="number"
                    value={formData.table_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, table_number: e.target.value }))}
                    placeholder="Enter table number"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "free" | "serving" | "completed") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="serving">Serving</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col xs:flex-row gap-2 xs:gap-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update Table"
                    ) : (
                      "Add Table"
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 xs:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`hover:shadow-lg transition-shadow ${
                table.status === "free"
                  ? "bg-green-50 border-green-200"
                  : table.status === "serving"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">Table #{table.table_number}</CardTitle>
                  <Badge
                    className={getStatusColor(table.status)}
                    title={
                      table.status === "free"
                        ? "Table is available for new customers."
                        : table.status === "serving"
                        ? "Table is currently serving customers."
                        : table.status === "completed"
                        ? "Completed, ready to be freed."
                        : ""
                    }
                  >
                    {getStatusIcon(table.status)}
                    <span className="ml-1 font-semibold">
                      {table.status === "free" && "Free"}
                      {table.status === "serving" && "Serving"}
                      {table.status === "completed" && "Completed"}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Created: {new Date(table.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 cycle-status-btn font-semibold border-2 shadow-sm ${
                        table.status === "free"
                          ? "bg-green-200 text-green-900 border-green-400 hover:bg-green-300"
                          : table.status === "serving"
                          ? "bg-yellow-200 text-yellow-900 border-yellow-400 hover:bg-yellow-300"
                          : "bg-blue-200 text-blue-900 border-blue-400 hover:bg-blue-300"
                      }`}
                      onClick={() => {
                        let nextStatus: Table["status"];
                        if (table.status === "free") nextStatus = "serving";
                        else if (table.status === "serving") nextStatus = "completed";
                        else nextStatus = "free";
                        updateTableStatus(table, nextStatus);
                      }}
                    >
                      {getStatusIcon(table.status)}
                      <span className="ml-2 capitalize">{table.status} (Next: {table.status === "free" ? "serving" : table.status === "serving" ? "completed" : "free"})</span>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(table)} className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isEditing ? "Edit Table" : "Add New Table"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="table_number">Table Number *</Label>
                            <Input
                              id="table_number"
                              type="number"
                              value={formData.table_number}
                              onChange={(e) => setFormData((prev) => ({ ...prev, table_number: e.target.value }))}
                              placeholder="Enter table number"
                              min="1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value: "free" | "serving" | "completed") =>
                                setFormData((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="serving">Serving</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1">
                              {saving ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Saving...
                                </>
                              ) : isEditing ? (
                                "Update Table"
                              ) : (
                                "Add Table"
                              )}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(table)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tables found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first table.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetForm()
                      setFormData((prev) => ({ ...prev, table_number: "1" }))
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Table" : "Add New Table"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="table_number">Table Number *</Label>
                      <Input
                        id="table_number"
                        type="number"
                        value={formData.table_number}
                        onChange={(e) => setFormData((prev) => ({ ...prev, table_number: e.target.value }))}
                        placeholder="Enter table number"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "free" | "serving" | "completed") =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="serving">Serving</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving} className="flex-1">
                        {saving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : isEditing ? (
                          "Update Table"
                        ) : (
                          "Add Table"
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
