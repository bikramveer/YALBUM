import { supabase } from "./supabase";

// =====================================================
// STORAGE SERVICE
// =====================================================
// Handles all photo upload/download/delete operations
// This abstraction makes it easy to switch storage
// providers (Supabase → Cloudflare R2) later if needed
// =====================================================

const BUCKET_NAME = 'photos';

export async function uploadPhoto(
    file: File,
    userId: string,
): Promise<string> {
    // make sure filename is unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',   //cache for 1 hour
        upsert: false,          // don't overwrite existing files
      });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload photo: ${error.message}`);
    }
    
    return data.path;
};

export async function uploadCompressedPhoto(
  file: File,
  userId: string,
  originalPath: string,
): Promise<string | null> {
  try {
    // Create a canvas to compress the image
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)

    const blob = await new Promise<Blob | null>(resolve => 
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    )
    if (!blob) return null

    const timestamp = originalPath.split('/')[1]?.split('.')[0] || Date.now()
    const compressedPath = `${userId}/compressed/${timestamp}.jpg`

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(compressedPath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.warn('Compressed upload failed:', error)
      return null
    }

    return data.path
  } catch (error) {
    console.warn('Compression failed:', error)
    return null
  }
}

export async function uploadMultiplePhotos (
  files: File[],
  userId: string,
): Promise<string[]> {
    const uploadPromises = files.map(file => uploadPhoto(file, userId));
    return Promise.all(uploadPromises);
}

export async function generateSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 86400)

  if (error || !data?.signedUrl) {
    console.error('Failed to generate signed URL for:', storagePath, error)
    return ''
  }

  return data.signedUrl
}

export async function generateSignedUrls(storagePaths: string[]): Promise<Record<string, string>> {
  const results = await Promise.all(
    storagePaths.map(async (path) => ({
      path,
      url: await generateSignedUrl(path)
    }))
  )

  return results.reduce((acc, { path, url }) => {
    acc[path] = url
    return acc
  }, {} as Record<string, string>)
}

export function getPhotoUrl(storagePath: string): string {
  console.warn('getPhotoUrl called direclty - consider pre-generating signed URLs in fetch function')
  return storagePath
}

export async function deletePhoto(storagePath: string, compressedPath?: string | null): Promise<boolean> {
    const pathsToDelete = [storagePath]
    if (compressedPath) pathsToDelete.push(compressedPath)

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete)

    if (error) {
        console.error('Delete error:', error);
        return false;
    }

    return true;
}

export function getPhotoMetadata(file: File) {
    return {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
    }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic'
    ]
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "That file type doesn't work yet. I'll get it working soon."
      }
    }

    const maxSize = 10 * 1024 * 1024        // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "The file is too large. I'll adjust some things to get it working."  
      }
    }

    return { valid: true }
}