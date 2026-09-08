/**
 * Retrieves and validates the Cloudinary unsigned upload configuration from Vite environment variables.
 * @returns {{
 *   isConfigured: boolean,
 *   cloudName: string,
 *   uploadPreset: string,
 *   folder: string,
 *   errors: string[]
 * }}
 */
export const getCloudinaryConfig = () => {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();
  const folder = (import.meta.env.VITE_CLOUDINARY_FOLDER || 'velvorax-marketplace/listings').trim();

  const errors = [];
  if (!cloudName) {
    errors.push('VITE_CLOUDINARY_CLOUD_NAME is not defined in frontend/.env');
  }
  if (!uploadPreset) {
    errors.push('VITE_CLOUDINARY_UPLOAD_PRESET is not defined in frontend/.env');
  }

  return {
    isConfigured: errors.length === 0,
    cloudName,
    uploadPreset,
    folder,
    errors
  };
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB per image
export const MAX_LISTING_IMAGES = 3;
export const MIN_LISTING_IMAGES = 1;

/**
 * Validates an image file before upload.
 * Validation order: 1. File type -> 2. File size
 * @param {File} file 
 * @param {Object} options 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateListingImage = (file, options = {}) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  const maxBytes = options.maxSizeBytes || MAX_IMAGE_SIZE_BYTES;
  const allowedMime = options.allowedTypes || ALLOWED_IMAGE_TYPES;

  // 1. Check file type (JPG, JPEG, PNG, WEBP)
  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  const hasValidMime = allowedMime.includes(fileType);

  if (!hasValidMime && !hasValidExt) {
    return {
      isValid: false,
      error: 'Please upload JPG, JPEG, PNG, or WEBP images.'
    };
  }

  // 2. Check file size (Maximum 1 MB per image)
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: 'Each image must be 1 MB or smaller.'
    };
  }

  return { isValid: true, error: null };
};

/**
/**
 * Upload an image file directly to Cloudinary using Unsigned Upload.
 * 
 * NOTE:
 * - Unsigned uploads do NOT require or use any API Key or API Secret.
 * - FormData contains only 'file' and 'upload_preset'.
 * - Upload preset must be configured as 'Unsigned' in Cloudinary Console.
 * 
 * @param {File} file - Browser File object
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback ({ percent, loaded, total })
 * @returns {Promise<{
 *   url: string,
 *   secure_url: string,
 *   public_id: string,
 *   width: number,
 *   height: number,
 *   format: string,
 *   resource_type: string,
 *   bytes: number
 * }>}
 */
export const uploadImageToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // 1. Client-side file validation
    const validation = validateListingImage(file, options);
    if (!validation.isValid) {
      return reject(new Error(validation.error));
    }

    // 2. Validate environment configuration
    const config = getCloudinaryConfig();
    if (!config.isConfigured) {
      return reject(new Error(`Cloudinary Configuration Error: ${config.errors.join('; ')}`));
    }

    // 3. Prepare strictly unsigned FormData (NO api_key, NO signature, NO timestamp, NO secret)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

    // 4. Safe development-only diagnostic logging (NO credentials or secrets)
    if (import.meta.env?.DEV) {
      console.log('[Cloudinary Config]', {
        cloudName: config.cloudName,
        uploadPreset: config.uploadPreset
      });
      console.log('[Cloudinary Upload URL]', uploadUrl);
      console.log('[Cloudinary Pre-Upload Debug]', {
        cloudName: config.cloudName,
        uploadPreset: config.uploadPreset,
        uploadUrl,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size
      });

      for (const [key, value] of formData.entries()) {
        console.log('[Cloudinary FormData]', key, key === 'file' ? value?.name : value);
      }
    }

    // 5. Perform XMLHttpRequest for real-time progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);
    xhr.timeout = options.timeout || 60000; // 60s timeout

    // Progress handler
    if (typeof options.onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
          options.onProgress({ percent, loaded: e.loaded, total: e.total });
        }
      };
    }

    // Success / Error handler
    xhr.onload = () => {
      let response = null;
      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {
        response = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && response?.public_id) {
        resolve({
          url: response.url,
          secure_url: response.secure_url || response.url,
          public_id: response.public_id,
          publicId: response.public_id,
          width: response.width,
          height: response.height,
          format: response.format,
          resource_type: response.resource_type || 'image',
          resourceType: response.resource_type || 'image',
          bytes: response.bytes
        });
      } else {
        const responseText = xhr.responseText;
        let errorMessage = 'Cloudinary upload failed';
        try {
          const data = JSON.parse(responseText);
          errorMessage = data?.error?.message || errorMessage;
        } catch {
          // keep default message
        }

        if (xhr.status === 401 && (errorMessage.toLowerCase().includes('unknown api key') || errorMessage.toLowerCase().includes('must supply api_key'))) {
          errorMessage = `Upload preset "${config.uploadPreset}" is not configured as "Unsigned" or does not exist in Cloudinary account "${config.cloudName}". In Cloudinary Dashboard -> Settings -> Upload Presets, ensure the preset exists and its Signing Mode is set to "Unsigned".`;
        }

        console.error('Cloudinary upload failed:', {
          status: xhr.status,
          body: responseText,
          cloudName: config.cloudName,
          uploadPreset: config.uploadPreset,
          uploadUrl,
          suggestedFix: 'Ensure upload preset is created in Cloudinary Console with Signing Mode set to "Unsigned"'
        });

        reject(new Error(`Cloudinary upload failed (${xhr.status}): ${errorMessage}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred while connecting to Cloudinary. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. The network connection was too slow. Please try again.'));
    };

    // Send multipart/form-data with browser-generated boundary (do not set Content-Type header manually)
    xhr.send(formData);
  });
};

/**
 * Generate Cloudinary CDN transformed URLs (responsive resizing, format optimization, quality auto).
 * 
 * @param {string} urlOrPublicId 
 * @param {Object} transformations 
 * @returns {string}
 */
export const getOptimizedImageUrl = (urlOrPublicId, transformations = {}) => {
  if (!urlOrPublicId) return '';

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto'
  } = transformations;

  // Build transformation string
  const parts = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop && (width || height)) parts.push(`c_${crop}`);
  if (gravity && crop === 'fill') parts.push(`g_${gravity}`);
  if (quality) parts.push(`q_${quality}`);
  if (format) parts.push(`f_${format}`);

  const transformString = parts.join(',');

  // If already a Cloudinary URL
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    if (!transformString) return urlOrPublicId;
    return urlOrPublicId.replace('/upload/', `/upload/${transformString}/`);
  }

  // If it's a pure public ID
  if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
    const config = getCloudinaryConfig();
    const cloud = config.cloudName || 'attcc2xg';
    const prefix = transformString ? `${transformString}/` : '';
    return `https://res.cloudinary.com/${cloud}/image/upload/${prefix}${urlOrPublicId}`;
  }

  // External URL
  return urlOrPublicId;
};

/**
 * Quick helper for responsive thumbnail URL
 */
export const getThumbnailUrl = (urlOrPublicId, width = 320, height = 240) => {
  return getOptimizedImageUrl(urlOrPublicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

export const cloudinaryService = {
  getCloudinaryConfig,
  uploadImageToCloudinary,
  validateListingImage,
  getOptimizedImageUrl,
  getThumbnailUrl,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES,
  MIN_LISTING_IMAGES
};

export default cloudinaryService;

