import { put, del } from '@vercel/blob';

export interface BlobUploadResult {
  url: string;
  success: boolean;
  error?: string;
}

export async function uploadImage(file: File): Promise<BlobUploadResult> {
  try {
    // Validate file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      return {
        url: '',
        success: false,
        error: 'File size must be less than 3MB'
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        url: '',
        success: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `product-${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return {
      url: blob.url,
      success: true
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      url: '',
      success: false,
      error: 'Failed to upload image. Please try again.'
    };
  }
}

export async function uploadMultipleImages(files: File[]): Promise<BlobUploadResult[]> {
  const results: BlobUploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadImage(file);
    results.push(result);
    
    if (!result.success) {
      // Stop uploading if one fails
      break;
    }
  }
  
  return results;
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract blob ID from URL
    const urlParts = imageUrl.split('/');
    const blobId = urlParts[urlParts.length - 1];
    
    if (!blobId) {
      console.error('Invalid blob URL');
      return false;
    }
    
    await del(blobId);
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    return false;
  }
}

export async function deleteMultipleImages(imageUrls: string[]): Promise<boolean> {
  try {
    const deletePromises = imageUrls.map(url => deleteImage(url));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Multiple image deletion error:', error);
    return false;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > 3 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 3MB' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
