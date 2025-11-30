// S3 Upload utility using presigned URLs
// This approach is more secure as files go directly from browser to S3

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Upload a file directly to S3 using presigned URL
 * @param content - File content (string or Blob)
 * @param certificateNumber - Unique certificate identifier
 * @param userId - User identifier
 * @param contentType - MIME type (default: image/svg+xml)
 */
export async function uploadToS3(
  content: string | Blob,
  certificateNumber: string,
  userId: string,
  contentType: string = 'image/svg+xml'
): Promise<UploadResult> {
  try {
    // Step 1: Request presigned URL from backend
    const urlResponse = await fetch(`${API_BASE_URL}/api/get-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateNumber,
        userId,
        contentType,
      }),
    });

    if (!urlResponse.ok) {
      const error = await urlResponse.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { uploadUrl, publicUrl } = await urlResponse.json();

    // Step 2: Upload directly to S3 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: content,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
    }

    return {
      success: true,
      publicUrl,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get presigned download URL for a certificate
 * @param certificateNumber - Unique certificate identifier
 * @param userId - User identifier
 */
export async function getDownloadUrl(
  certificateNumber: string,
  userId: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-download-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateNumber,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const { downloadUrl } = await response.json();
    return downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    return null;
  }
}

/**
 * List all certificates for a user
 * @param userId - User identifier
 */
export async function listUserCertificates(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/certificates/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to list certificates');
    }

    const { certificates } = await response.json();
    return certificates;
  } catch (error) {
    console.error('Error listing certificates:', error);
    return [];
  }
}

/**
 * Check if S3 backend is available
 */
export async function checkS3Backend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
