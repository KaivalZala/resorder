"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Upload, AlertCircle, CheckCircle, X, ExternalLink, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { MenuItem } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import {
  uploadMenuImageWithFallback as uploadMenuImage,
  deleteMenuImageWithFallback as deleteMenuImage,
  checkBucketExists,
} from "@/lib/storage-utils-fallback"

// Define FormContent outside the main component to prevent re-creation on every render
interface FormContentProps {
  formData: {
    name: string
    description: string
    price: string
    category: string
    tags: string[]
    in_stock: boolean
    order: number
    discount: number
    discount_type: 'percentage' | 'fixed'
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string
    description: string
    price: string
    category: string
    tags: string[]
    in_stock: boolean
    order: number
    discount: number
    discount_type: 'percentage' | 'fixed'
  }>>
  imageFile: File | null
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
  imageUrl: string
  setImageUrl: React.Dispatch<React.SetStateAction<string>>
  uploadingImage: boolean
  uploadError: string | null
  bucketExists: boolean | null
  saving: boolean
  isEditing: boolean
  selectedItem: MenuItem | null
  useExternalUrl: boolean
  setUseExternalUrl: React.Dispatch<React.SetStateAction<boolean>>
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleImageUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSave: () => void
  resetForm: () => void
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleTagToggle: (tag: string) => void
  clearImage: () => void
  categories: string[]
  availableTags: string[]
  menuItems: MenuItem[]
}

const FormContent = ({
  formData,
  setFormData,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  imageUrl,
  setImageUrl,
  uploadingImage,
  uploadError,
  bucketExists,
  saving,
  isEditing,
  selectedItem,
  useExternalUrl,
  setUseExternalUrl,
  handleImageChange,
  handleImageUrlChange,
  handleSave,
  resetForm,
  setDialogOpen,
  handleTagToggle,
  clearImage,
  categories,
  availableTags,
  menuItems,
}: FormContentProps) => (
  <div className="space-y-4">
    {isEditing && selectedItem && menuItems && (
      <div className="mb-2 text-sm text-gray-600">
        Sequence: #{
          menuItems.findIndex((item) => item.id === selectedItem.id) + 1
        }
      </div>
    )}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Item name"
        />
      </div>
      <div>
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
          placeholder="Order"
        />
      </div>
      <div>
        <Label htmlFor="discount">Discount</Label>
        <Input
          id="discount"
          type="number"
          step="0.01"
          value={formData.discount}
          onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
          placeholder="Discount"
        />
      </div>
      <div>
        <Label htmlFor="discount_type">Discount Type</Label>
        <Select
          value={formData.discount_type}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, discount_type: value as 'percentage' | 'fixed' }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description || ""}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="Item description"
      />
    </div>

    <div>
      <Label htmlFor="category">Category *</Label>
      <div className="flex flex-col items-center w-full xs:items-start xs:flex-row xs:justify-start">
        <Select
          value={formData.category || ""}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger className="block w-full max-w-xs mx-auto pl-10 xs:pl-0 xs:w-auto xs:mx-0">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant={formData.tags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Image</Label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setUseExternalUrl(!useExternalUrl)}>
            {useExternalUrl ? "Upload File" : "Use URL"}
          </Button>

        </div>
      </div>

      

      <div className="space-y-3">
        {useExternalUrl ? (
          <div>
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl || ""}
              onChange={handleImageUrlChange}
              disabled={uploadingImage}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste image URL from imgur.com, unsplash.com, or any public image host
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage || !bucketExists}
              className="flex-1"
            />
            {imageFile && (
              <Button type="button" variant="outline" size="icon" onClick={clearImage} disabled={uploadingImage}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {uploadingImage && (
          <Alert>
            <LoadingSpinner size="sm" className="h-4 w-4" />
            <AlertDescription>Uploading image... Please wait.</AlertDescription>
          </Alert>
        )}

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">{uploadError}</AlertDescription>
          </Alert>
        )}

        {imagePreview && (
          <div className="mt-3">
            <Label className="text-sm text-gray-600">Preview:</Label>
            <div className="relative mt-1">
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                width={200}
                height={150}
                className="rounded-lg object-cover border"
              />
              {(imageFile || (useExternalUrl && imageUrl)) && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {useExternalUrl
              ? "Use any public image URL (imgur.com recommended)"
              : "Supported: JPG, PNG, GIF, WebP • Max size: 5MB"}
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="in_stock"
        checked={formData.in_stock}
        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, in_stock: checked }))}
      />
      <Label htmlFor="in_stock">In Stock</Label>
    </div>

    <div className="flex gap-2">
      <Button onClick={handleSave} disabled={saving || uploadingImage} className="flex-1">
        {saving ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Saving...
          </>
        ) : uploadingImage ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {isEditing ? "Update Item" : "Add Item"}
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          resetForm()
          setDialogOpen(false)
        }}
        disabled={saving || uploadingImage}
      >
        Cancel
      </Button>
    </div>
  </div>
)

export default function MenuManagementPage() {
  // ...existing state declarations...
  // Add this function to move menu items up or down
  const moveMenuItem = async (idx: number, direction: "up" | "down") => {
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === menuItems.length - 1)
    ) {
      return
    }
    const newMenuItems = [...menuItems]
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    // Swap order fields
    const tempOrder = newMenuItems[idx].order
    newMenuItems[idx].order = newMenuItems[swapIdx].order
    newMenuItems[swapIdx].order = tempOrder
    // Swap in array
    ;[newMenuItems[idx], newMenuItems[swapIdx]] = [newMenuItems[swapIdx], newMenuItems[idx]]
    setMenuItems(newMenuItems)
    // Update backend for both items
    try {
      await Promise.all([
        supabase.from("menu_items").update({ order: newMenuItems[idx].order }).eq("id", newMenuItems[idx].id),
        supabase.from("menu_items").update({ order: newMenuItems[swapIdx].order }).eq("id", newMenuItems[swapIdx].id),
      ])
    } catch (err) {
      toast({
        title: "Order update error",
        description: "Could not update menu item order. Please try again.",
        variant: "destructive",
      })
      // Optionally, refetch menu items to restore correct state
      fetchMenuItems()
    }
  }

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    tags: [],
    in_stock: true,
    order: 0,
    discount: 0,
    discount_type: "fixed",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [useExternalUrl, setUseExternalUrl] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const categories = ["Tandoori Starters Vegetaria", "Tandoori Starters Non-Vegetaria", "Main Course(Indian) Vegetarian"]
  const availableTags = ["veg", "non-veg", "spicy", "healthy", "gluten-free"]

  useEffect(() => {
    fetchMenuItems()
    checkStorageBucket()
  }, [])



  const checkStorageBucket = async () => {
    const result = await checkBucketExists()
    setBucketExists(result.exists)
    if (!result.exists) {
      console.log("Storage bucket not found:", result.error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").order("order", { ascending: true }).order("category").order("name")

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      tags: [],
      in_stock: true,
      order: 0,
      discount: 0,
      discount_type: "fixed",
    })
    setImageFile(null)
    setImagePreview(null)
    setImageUrl("")
    setUploadError(null)
    setSelectedItem(null)
    setIsEditing(false)
    setUseExternalUrl(false)
  }

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item)
    // Find the visible sequence (index+1) in the current menuItems array
    const visibleOrder = menuItems.findIndex((m) => m.id === item.id) + 1
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price?.toString() || "",
      category: item.category || "",
      tags: item.tags || [],
      in_stock: item.in_stock ?? true,
      order: visibleOrder,
      discount: item.discount ?? 0,
      discount_type: item.discount_type ?? "fixed",
    })
    setImagePreview(item.image_url || null)
    setImageUrl(item.image_url || "")
    setImageFile(null)
    setUploadError(null)
    setIsEditing(true)
    setUseExternalUrl(!!item.image_url && !item.image_url.includes("supabase"))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)

    if (!file) {
      setImageFile(null)
      setImagePreview(selectedItem?.image_url || null)
      return
    }

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, GIF, WebP)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB")
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setImagePreview(url)
    setImageFile(null)
    setUploadError(null)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    setUploadError(null)

    try {
      let finalImageUrl = selectedItem?.image_url || null

      // Handle image upload or URL
      if (useExternalUrl && imageUrl.trim()) {
        // Use external URL
        finalImageUrl = imageUrl.trim()
      } else if (imageFile && bucketExists) {
        // Upload file to Supabase storage
        setUploadingImage(true)

        const uploadResult = await uploadMenuImage(imageFile)

        if (uploadResult.success && uploadResult.url) {
          finalImageUrl = uploadResult.url
          toast({
            title: "Image uploaded successfully! ✅",
            description: "Your image has been uploaded.",
          })
        } else {
          setUploadError(uploadResult.error || "Upload failed")
          const continueWithoutImage = confirm(
            `Image upload failed: ${uploadResult.error}\n\nDo you want to save the menu item without the new image?`
          )

          if (!continueWithoutImage) {
            setSaving(false)
            setUploadingImage(false)
            return
          }
        }

        setUploadingImage(false)
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        tags: formData.tags,
        in_stock: formData.in_stock,
        image_url: finalImageUrl,
        order: formData.order,
        discount: formData.discount,
        discount_type: formData.discount_type,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && selectedItem) {
        const { error } = await supabase.from("menu_items").update(itemData).eq("id", selectedItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_items").insert(itemData)
        if (error) throw error
      }

      // Resequence all menu items' order fields to be continuous starting from 1
      const { data: allItems, error: fetchError } = await supabase.from("menu_items").select("id").order("order", { ascending: true })
      if (fetchError) throw fetchError
      if (allItems && allItems.length > 0) {
        for (let i = 0; i < allItems.length; i++) {
          const itemId = allItems[i].id
          const newOrder = i + 1
          const { error: updateError } = await supabase.from("menu_items").update({ order: newOrder }).eq("id", itemId)
          if (updateError) {
            console.error(`Error updating order for item ${itemId}:`, updateError)
            toast({
              title: "Order update error",
              description: `Could not update order for item ${itemId}: ${updateError.message}`,
              variant: "destructive",
            })
          }
        }
      }

      toast({
        title: "Success! 🎉",
        description: `Menu item ${isEditing ? "updated" : "created"} successfully.`,
      })

      resetForm()
      setDialogOpen(false)
      fetchMenuItems()
    } catch (error) {
      console.error("Error saving menu item:", error, JSON.stringify(error))
      toast({
        title: "Error saving menu item",
        description: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      // Delete image from storage if it exists and is from Supabase
      if (item.image_url && item.image_url.includes("supabase")) {
        await deleteMenuImage(item.image_url)
      }

      const { error } = await supabase.from("menu_items").delete().eq("id", item.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Menu item deleted successfully.",
      })

      fetchMenuItems()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleStock = async (item: MenuItem) => {
    try {
      const { error } = await supabase.from("menu_items").update({ in_stock: !item.in_stock }).eq("id", item.id)

      if (error) throw error

      fetchMenuItems()
    } catch (error) {
      console.error("Error updating stock status:", error)
    }
  }

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const clearImage = () => {
    setImageFile(null)
    setImageUrl("")
    setImagePreview(selectedItem?.image_url || null)
    setUploadError(null)
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
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold truncate">Menu Management</h1>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base truncate">Add, edit, and manage menu items</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setDialogOpen(true)
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full xs:max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              </DialogHeader>
              <FormContent 
                formData={formData}
                setFormData={setFormData}
                imageFile={imageFile}
                setImageFile={setImageFile}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                uploadingImage={uploadingImage}
                uploadError={uploadError}
                bucketExists={bucketExists}
                saving={saving}
                isEditing={isEditing}
                selectedItem={selectedItem}
                useExternalUrl={useExternalUrl}
                setUseExternalUrl={setUseExternalUrl}
                handleImageChange={handleImageChange}
                handleImageUrlChange={handleImageUrlChange}
                handleSave={handleSave}
                resetForm={resetForm}
                setDialogOpen={setDialogOpen}
                handleTagToggle={handleTagToggle}
                clearImage={clearImage}
                categories={categories}
                availableTags={availableTags}
                menuItems={menuItems}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 xs:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item, idx) => (
            <Card key={item.id} className={`${!item.in_stock ? "opacity-60" : ""}`}>
              <div className="relative">
                <Image
                  src={item.image_url || "/placeholder.svg?height=200&width=300"}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 left-2">
  <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow">
    #{idx + 1}
  </div>
</div>
<div className="absolute top-2 right-2">
  <Switch checked={item.in_stock} onCheckedChange={() => toggleStock(item)} size="sm" />
</div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <span className="text-lg font-bold text-green-600">₹{item.price.toFixed(2)}</span>
                </div>
                <Badge variant="secondary">{item.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleEdit(item)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 m-0 h-8 w-8 flex items-center justify-center"
                    onClick={async () => moveMenuItem(idx, "up")}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 m-0 h-8 w-8 flex items-center justify-center"
                    onClick={async () => moveMenuItem(idx, "down")}
                    disabled={idx === menuItems.length - 1}
                    title="Move Down"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}




