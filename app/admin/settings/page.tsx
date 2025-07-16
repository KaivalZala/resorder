"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, GripVertical, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { BillingSettings } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [billingFields, setBillingFields] = useState<BillingSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedField, setSelectedField] = useState<BillingSettings | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    field_name: "",
    field_label: "",
    field_type: "percentage" as const,
    field_value: "",
    applies_to: "subtotal" as const,
    is_active: true,
  })
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchBillingSettings()
  }, [])



  const fetchBillingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("billing_settings")
        .select("*")
        .order("calculation_order")
        .order("created_at")

      if (error) throw error
      setBillingFields(data || [])
    } catch (error) {
      console.error("Error fetching billing settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      field_name: "",
      field_label: "",
      field_type: "percentage",
      field_value: "",
      applies_to: "subtotal",
      is_active: true,
    })
    setSelectedField(null)
    setIsEditing(false)
  }

  const handleEdit = (field: BillingSettings) => {
    setSelectedField(field)
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_value: field.field_value.toString(),
      applies_to: field.applies_to,
      is_active: field.is_active,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!formData.field_name || !formData.field_label || !formData.field_value) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate field name format (no spaces, lowercase, underscores allowed)
    const fieldNameRegex = /^[a-z_]+$/
    if (!fieldNameRegex.test(formData.field_name)) {
      toast({
        title: "Invalid field name",
        description: "Field name must be lowercase letters and underscores only (e.g., 'delivery_fee').",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const fieldData = {
        field_name: formData.field_name,
        field_label: formData.field_label,
        field_type: formData.field_type,
        field_value: Number.parseFloat(formData.field_value),
        applies_to: formData.applies_to,
        is_active: formData.is_active,
        calculation_order: isEditing ? selectedField?.calculation_order : billingFields.length + 1,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && selectedField) {
        const { error } = await supabase.from("billing_settings").update(fieldData).eq("id", selectedField.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("billing_settings").insert(fieldData)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `Billing field ${isEditing ? "updated" : "created"} successfully.`,
      })

      resetForm()
      fetchBillingSettings()
    } catch (error: any) {
      console.error("Error saving billing field:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save billing field. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (field: BillingSettings) => {
    if (field.is_system_field) {
      toast({
        title: "Cannot delete",
        description: "System fields cannot be deleted, only disabled.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete "${field.field_label}"?`)) return

    try {
      const { error } = await supabase.from("billing_settings").delete().eq("id", field.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Billing field deleted successfully.",
      })

      fetchBillingSettings()
    } catch (error) {
      console.error("Error deleting billing field:", error)
      toast({
        title: "Error",
        description: "Failed to delete billing field. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFieldStatus = async (field: BillingSettings) => {
    try {
      const { error } = await supabase
        .from("billing_settings")
        .update({ is_active: !field.is_active, updated_at: new Date().toISOString() })
        .eq("id", field.id)

      if (error) throw error

      fetchBillingSettings()
    } catch (error) {
      console.error("Error updating field status:", error)
    }
  }

  const updateCalculationOrder = async (fieldId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from("billing_settings")
        .update({ calculation_order: newOrder, updated_at: new Date().toISOString() })
        .eq("id", fieldId)

      if (error) throw error

      fetchBillingSettings()
    } catch (error) {
      console.error("Error updating calculation order:", error)
    }
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const currentIndex = billingFields.findIndex((f) => f.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= billingFields.length) return

    const currentField = billingFields[currentIndex]
    const targetField = billingFields[newIndex]

    updateCalculationOrder(currentField.id, targetField.calculation_order)
    updateCalculationOrder(targetField.id, currentField.calculation_order)
  }

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-blue-100 text-blue-800"
      case "fixed_amount":
        return "bg-green-100 text-green-800"
      case "tax":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <div className="max-w-4xl mx-auto p-2 xs:p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 xs:gap-4 mb-6 w-full">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold truncate">Billing Settings</h1>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base truncate">Manage billing fields and calculation rules</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full xs:max-w-xl sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Billing Field" : "Add New Billing Field"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  <div>
                    <Label htmlFor="field_name">Field Name *</Label>
                    <Input
                      id="field_name"
                      value={formData.field_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, field_name: e.target.value }))}
                      placeholder="e.g., delivery_fee"
                      disabled={isEditing && selectedField?.is_system_field}
                    />
                    <p className="text-xs text-gray-500 mt-1">Lowercase letters and underscores only</p>
                  </div>
                  <div>
                    <Label htmlFor="field_label">Display Label *</Label>
                    <Input
                      id="field_label"
                      value={formData.field_label}
                      onChange={(e) => setFormData((prev) => ({ ...prev, field_label: e.target.value }))}
                      placeholder="e.g., Delivery Fee"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field_type">Field Type *</Label>
                    <Select
                      value={formData.field_type}
                      onValueChange={(value: "percentage" | "fixed_amount" | "tax") =>
                        setFormData((prev) => ({ ...prev, field_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
                        <SelectItem value="tax">Tax (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="field_value">
                      Value * {formData.field_type === "fixed_amount" ? "(₹)" : "(%)"}
                    </Label>
                    <Input
                      id="field_value"
                      type="number"
                      step="0.01"
                      value={formData.field_value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, field_value: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="applies_to">Applies To</Label>
                  <Select
                    value={formData.applies_to}
                    onValueChange={(value: "subtotal" | "total") =>
                      setFormData((prev) => ({ ...prev, applies_to: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtotal">Subtotal</SelectItem>
                      <SelectItem value="total">Running Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : isEditing ? (
                      "Update Field"
                    ) : (
                      "Add Field"
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

        <Card>
          <CardHeader>
            <CardTitle>Billing Fields</CardTitle>
            <p className="text-sm text-gray-600">
              Fields are calculated in order. Drag to reorder or use the arrow buttons.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    !field.is_active ? "opacity-60 bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveField(field.id, "up")} disabled={index === 0}>
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, "down")}
                      disabled={index === billingFields.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  <GripVertical className="h-5 w-5 text-gray-400" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{field.field_label}</h3>
                      <Badge className={getFieldTypeColor(field.field_type)}>{field.field_type}</Badge>
                      {field.is_system_field && <Badge variant="outline">System</Badge>}
                      {!field.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      {field.field_type === "fixed_amount" ? "$" : ""}
                      {field.field_value.toFixed(2)}
                      {field.field_type !== "fixed_amount" ? "%" : ""} • Applied to {field.applies_to}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={field.is_active} onCheckedChange={() => toggleFieldStatus(field)} />

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(field)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isEditing ? "Edit Billing Field" : "Add New Billing Field"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="field_name">Field Name *</Label>
                              <Input
                                id="field_name"
                                value={formData.field_name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, field_name: e.target.value }))}
                                placeholder="e.g., delivery_fee"
                                disabled={isEditing && selectedField?.is_system_field}
                              />
                              <p className="text-xs text-gray-500 mt-1">Lowercase letters and underscores only</p>
                            </div>
                            <div>
                              <Label htmlFor="field_label">Display Label *</Label>
                              <Input
                                id="field_label"
                                value={formData.field_label}
                                onChange={(e) => setFormData((prev) => ({ ...prev, field_label: e.target.value }))}
                                placeholder="e.g., Delivery Fee"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="field_type">Field Type *</Label>
                              <Select
                                value={formData.field_type}
                                onValueChange={(value: "percentage" | "fixed_amount" | "tax") =>
                                  setFormData((prev) => ({ ...prev, field_type: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                                  <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
                                  <SelectItem value="tax">Tax (%)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="field_value">
                                Value * {formData.field_type === "fixed_amount" ? "(₹)" : "(%)"}
                              </Label>
                              <Input
                                id="field_value"
                                type="number"
                                step="0.01"
                                value={formData.field_value}
                                onChange={(e) => setFormData((prev) => ({ ...prev, field_value: e.target.value }))}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="applies_to">Applies To</Label>
                            <Select
                              value={formData.applies_to}
                              onValueChange={(value: "subtotal" | "total") =>
                                setFormData((prev) => ({ ...prev, applies_to: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="subtotal">Subtotal</SelectItem>
                                <SelectItem value="total">Running Total</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_active"
                              checked={formData.is_active}
                              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                            />
                            <Label htmlFor="is_active">Active</Label>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1">
                              {saving ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Saving...
                                </>
                              ) : isEditing ? (
                                "Update Field"
                              ) : (
                                "Add Field"
                              )}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {!field.is_system_field && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(field)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {billingFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No billing fields configured.</p>
                  <p className="text-sm">Click "Add Field" to create your first billing rule.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
