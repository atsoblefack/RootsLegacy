import { createClient } from 'npm:@supabase/supabase-js';

const BUCKET_NAME = 'family-photos';

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

/**
 * Get public URL for a file in the family-photos bucket
 * The bucket must be set to public in Supabase Storage settings
 * 
 * @param filePath - Path to the file in the bucket (e.g., 'family-123/photo.jpg')
 * @returns Public URL that never expires
 */
export function getPublicPhotoUrl(filePath: string): string {
  const supabase = getSupabaseAdmin();
  
  const { data } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Upload a photo and return its permanent public URL
 * 
 * @param familyId - Family ID for organizing files
 * @param fileName - Name of the file
 * @param fileBuffer - File buffer/blob
 * @returns Public URL that never expires
 */
export async function uploadPhotoAndGetUrl(
  familyId: string,
  fileName: string,
  fileBuffer: ArrayBuffer
): Promise<string> {
  try {
    const supabase = getSupabaseAdmin();
    const filePath = `${familyId}/${Date.now()}-${fileName}`;

    // Upload file
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL (permanent, never expires)
    const publicUrl = getPublicPhotoUrl(data.path);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Delete a photo from storage
 * 
 * @param filePath - Path to the file in the bucket
 */
export async function deletePhoto(filePath: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

/**
 * Initialize the bucket if it doesn't exist
 * This should be called once during setup
 */
export async function initializeBucket(): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    // Try to list files to check if bucket exists
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });

    if (error && error.message.includes('not found')) {
      // Bucket doesn't exist, create it
      console.log(`Creating bucket: ${BUCKET_NAME}`);
      // Note: Bucket creation should be done via Supabase dashboard or API
      // This is just a placeholder
    }
  } catch (error: any) {
    console.error('Error initializing bucket:', error);
  }
}
