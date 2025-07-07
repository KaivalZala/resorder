import { createClient } from "@/utils/supabase/client"

const supabase = createClient()
const BUCKET_NAME = "menu-images"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  debug?: any
}

export async function uploadMenuImage(file: File): Promise<UploadResult> {
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

    // Enhanced bucket checking with detailed debugging
    console.log("Checking for buckets...")
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    console.log("Buckets response:", { buckets, listError })

    if (listError) {
      console.error("Error listing buckets:", listError)
      return {
        success: false,
        error: `Storage service error: ${listError.message}. Please check your Supabase configuration.`,
        debug: listError,
      }
    }

    console.log(
      "Available buckets:",
      buckets?.map((b) => ({ name: b.name, public: b.public })),
    )

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)
    console.log(`Bucket '${BUCKET_NAME}' exists:`, bucketExists)

    if (!bucketExists) {
      // Try to create the bucket automatically
      console.log("Attempting to create bucket automatically...")

      const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })

      if (createError) {
        console.error("Failed to create bucket:", createError)
        return {
          success: false,
          error: `Could not create storage bucket. Please create it manually in Supabase Dashboard: Storage → New Bucket → Name: "menu-images" → Make it PUBLIC. Error: ${createError.message}`,
          debug: { createError, availableBuckets: buckets },
        }
      }

      console.log("Bucket created successfully:", createData)
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `menu-items/${fileName}`

    console.log("Uploading file:", { fileName, filePath, fileSize: file.size })

    // Upload file
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
        debug: error,
      }
    }

    console.log("Upload successful:", data)

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
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
      debug: error,
    }
  }
}

export async function deleteMenuImage(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split(`/${BUCKET_NAME}/`)
    if (urlParts.length < 2) return false

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

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

// Debug function to check storage status
export async function debugStorageStatus() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    console.log("=== STORAGE DEBUG ===")
    console.log("Buckets:", buckets)
    console.log("Error:", error)
    console.log("Looking for bucket:", BUCKET_NAME)
    console.log(
      "Found:",
      buckets?.find((b) => b.name === BUCKET_NAME),
    )
    console.log("===================")
    return { buckets, error }
  } catch (err) {
    console.error("Debug error:", err)
    return { error: err }
  }
}
