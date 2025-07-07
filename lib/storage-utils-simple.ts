import { createClient } from "@/utils/supabase/client"

const supabase = createClient()

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadMenuImageSimple(file: File): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Please select an image file (JPG, PNG, GIF, WebP)",
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Image must be smaller than 5MB",
      }
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `menu-items/${fileName}`

    console.log("Attempting upload:", { fileName, filePath, fileSize: file.size })

    // Try upload directly - let it fail if bucket doesn't exist
    const { data, error } = await supabase.storage.from("menu-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)

      // If bucket doesn't exist, provide clear instructions
      if (error.message.includes("Bucket not found")) {
        return {
          success: false,
          error: "Storage bucket not found. Please run the SQL script first, then refresh this page.",
        }
      }

      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      }
    }

    console.log("Upload successful:", data)

    // Get public URL
    const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(filePath)

    console.log("Public URL:", urlData.publicUrl)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error("Unexpected upload error:", error)
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
    }
  }
}

export async function deleteMenuImageSimple(url: string): Promise<boolean> {
  try {
    const urlParts = url.split("/menu-images/")
    if (urlParts.length < 2) return false

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("menu-images").remove([filePath])

    if (error) {
      console.error("Error deleting image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting image:", error)
    return false
  }
}
