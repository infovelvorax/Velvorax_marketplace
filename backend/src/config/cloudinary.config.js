import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

/**
 * Safely delete an asset from Cloudinary using server-side API Secret.
 * @param {string} publicId - The Cloudinary public_id of the asset.
 * @param {string} resourceType - 'image', 'video', or 'raw'
 * @returns {Promise<{success: boolean, result?: any, error?: string}>}
 */
export const deleteCloudinaryAsset = async (publicId, resourceType = 'image') => {
  if (!publicId || publicId.startsWith('external_')) {
    return { success: true, result: 'skipped_external' };
  }

  if (!isCloudinaryConfigured) {
    console.warn(`[Cloudinary] Server credentials not configured; skipped deleting remote asset "${publicId}"`);
    return { success: true, result: 'skipped_no_credentials' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    return { success: result.result === 'ok' || result.result === 'not found', result };
  } catch (error) {
    console.error(`[Cloudinary] Error destroying asset "${publicId}":`, error.message);
    return { success: false, error: error.message };
  }
};

export { cloudinary, isCloudinaryConfigured };
export default cloudinary;
