import React, { useState, useRef, useCallback } from 'react';
import './ListingImageUploader.css';
import {
  getCloudinaryConfig,
  uploadImageToCloudinary,
  validateListingImage,
  MAX_LISTING_IMAGES,
  MIN_LISTING_IMAGES,
  MAX_IMAGE_SIZE_BYTES
} from '../../../services/cloudinary.service';
import { useToast } from '../../../hooks/useToast';

/**
 * ListingImageUploader - Interactive, drag-and-drop Cloudinary image uploader.
 * Reads VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET via import.meta.env.
 * 
 * @param {Object} props
 * @param {Array} props.media - Array of media items [{ url, secure_url, publicId, width, height, format, isCover, order }]
 * @param {Function} props.onChange - Handler called with updated media array
 * @param {number} props.minImages - Minimum required images (default: 3)
 * @param {number} props.maxImages - Maximum allowed images (default: 10)
 * @param {boolean} props.disabled - Disable interaction
 * @param {string} props.folder - Target Cloudinary folder
 */
export function ListingImageUploader({
  media = [],
  onChange,
  minImages = MIN_LISTING_IMAGES,
  maxImages = MAX_LISTING_IMAGES,
  disabled = false,
  folder = 'velvorax-marketplace/listings'
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const cloudinaryConfig = getCloudinaryConfig();
  const isCloudinaryReady = cloudinaryConfig.isConfigured;

  const [isDragging, setIsDragging] = useState(false);
  const [activeUploads, setActiveUploads] = useState({}); // { [uploadId]: { progress: number, error: string|null, file: File, previewUrl: string } }
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Trigger file selection dialog
  const handleBrowseClick = () => {
    if (disabled) return;
    if (!isCloudinaryReady) {
      showToast('error', `Cloudinary Configuration Missing: ${cloudinaryConfig.errors.join('; ')}`);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload single file to Cloudinary
  const uploadSingleFile = useCallback(async (file, uploadId, previewUrl) => {
    try {
      setActiveUploads(prev => ({
        ...prev,
        [uploadId]: { progress: 5, error: null, file, previewUrl }
      }));

      const result = await uploadImageToCloudinary(file, {
        folder,
        onProgress: ({ percent }) => {
          setActiveUploads(prev => {
            if (!prev[uploadId]) return prev;
            return {
              ...prev,
              [uploadId]: { ...prev[uploadId], progress: Math.max(5, percent) }
            };
          });
        }
      });

      // Construct verified media metadata
      const newMediaItem = {
        url: result.secure_url || result.url,
        secure_url: result.secure_url || result.url,
        publicId: result.public_id,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type || 'image',
        isCover: media.length === 0, // First uploaded photo becomes cover by default
        order: media.length
      };

      // Remove from active uploads and push to parent media list
      setActiveUploads(prev => {
        const next = { ...prev };
        delete next[uploadId];
        return next;
      });

      onChange(prevMedia => {
        const currentList = Array.isArray(prevMedia) ? prevMedia : [];
        const isFirst = currentList.length === 0;
        return [...currentList, { ...newMediaItem, isCover: isFirst }];
      });

      showToast('success', `Photo "${file.name}" uploaded successfully!`);
    } catch (err) {
      console.error('Upload failed:', err);
      setActiveUploads(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          progress: 0,
          error: err.message || 'Upload failed. Click to retry.'
        }
      }));
      showToast('error', err.message || `Failed to upload "${file.name}"`);
    }
  }, [folder, media.length, onChange, showToast]);

  // Process incoming files from file picker or drag-and-drop
  const processFiles = useCallback((rawFiles) => {
    if (disabled || !rawFiles || rawFiles.length === 0) return;

    if (!isCloudinaryReady) {
      showToast('error', `Cloudinary Configuration Missing: ${cloudinaryConfig.errors.join('; ')}`);
      return;
    }

    const fileList = Array.from(rawFiles);
    const currentTotal = media.length + Object.keys(activeUploads).length;

    if (currentTotal + fileList.length > maxImages) {
      const allowedCount = Math.max(0, maxImages - currentTotal);
      showToast('error', 'You can upload a maximum of 3 images per listing.');
      if (allowedCount === 0) return;
      fileList.splice(allowedCount);
    }

    fileList.forEach(file => {
      const validation = validateListingImage(file, { maxSizeBytes: MAX_IMAGE_SIZE_BYTES });
      if (!validation.isValid) {
        showToast('error', validation.error);
        return;
      }

      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      uploadSingleFile(file, uploadId, previewUrl);
    });
  }, [disabled, isCloudinaryReady, cloudinaryConfig.errors, media.length, activeUploads, maxImages, showToast, uploadSingleFile]);

  // Drag & drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
      // Reset input value so identical file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Mark an image as the primary cover photo
  const handleSetCover = (index) => {
    if (disabled || index < 0 || index >= media.length) return;
    const targetItem = media[index];
    const remaining = media.filter((_, i) => i !== index);
    const updated = [
      { ...targetItem, isCover: true, order: 0 },
      ...remaining.map((item, idx) => ({ ...item, isCover: false, order: idx + 1 }))
    ];
    onChange(updated);
    showToast('info', 'Primary cover photo updated.');
  };

  // Reorder images (move left/right)
  const handleMove = (fromIndex, toIndex) => {
    if (disabled || toIndex < 0 || toIndex >= media.length) return;
    const items = [...media];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);

    // Keep the first item as cover if none is explicitly cover
    const reordered = items.map((item, idx) => ({
      ...item,
      order: idx,
      isCover: idx === 0
    }));

    onChange(reordered);
  };

  // Remove uploaded image from state
  const handleRemove = (index) => {
    if (disabled || index < 0 || index >= media.length) return;
    const updated = media.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      order: idx,
      isCover: idx === 0
    }));
    onChange(updated);
    showToast('info', 'Photo removed from listing.');
  };

  // Retry a failed upload in the active queue
  const handleRetry = (uploadId) => {
    const item = activeUploads[uploadId];
    if (item && item.file) {
      uploadSingleFile(item.file, uploadId, item.previewUrl);
    }
  };

  // Discard a failed queue item
  const handleDismissUpload = (uploadId) => {
    setActiveUploads(prev => {
      const next = { ...prev };
      delete next[uploadId];
      return next;
    });
  };

  const totalCount = media.length;
  const isMinMet = totalCount >= minImages;
  const isMaxReached = totalCount >= maxImages;

  return (
    <div className="listing-image-uploader">
      
      {/* Hidden native multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
        style={{ display: 'none' }}
        disabled={disabled || isMaxReached}
      />

      {/* Header with status counter */}
      <div className="uploader-header">
        <span className="uploader-title">
          Listing Photos (Upload up to 3 images)
        </span>
        <div className="uploader-counter">
          <span>{totalCount} of {maxImages} uploaded</span>
          <span className={`uploader-counter-badge ${totalCount > 0 ? 'valid' : 'pending'}`}>
            {totalCount > 0 ? `${totalCount}/3 Uploaded` : 'Up to 3 Images (Max 1 MB each)'}
          </span>
        </div>
      </div>

      {/* Cloudinary Environment Configuration Error Banner */}
      {!isCloudinaryReady && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3 mb-4">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <strong className="block font-bold text-sm text-rose-300 mb-1">
              Cloudinary Configuration Required
            </strong>
            <p className="mb-2">
              Image upload is unavailable because required environment configuration is missing:
            </p>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-rose-200">
              {cloudinaryConfig.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-rose-300/80">
              Please define these in <code className="px-1 py-0.5 bg-black/40 rounded">frontend/.env</code> and reload the Vite dev server.
            </p>
          </div>
        </div>
      )}

      {/* Dropzone */}
      {!isMaxReached && (
        <div
          onClick={handleBrowseClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`uploader-dropzone ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
        >
          <div className="uploader-dropzone-icon">📸</div>
          <div className="uploader-dropzone-title">
            Upload up to 3 images (Drag & drop or browse)
          </div>
          <div className="uploader-dropzone-subtitle font-medium">
            Maximum 1 MB per image • JPG, JPEG, PNG, WEBP
          </div>
          <button type="button" className="uploader-dropzone-btn" tabIndex={-1}>
            Select Photos (Slot {totalCount + 1} of 3)
          </button>
        </div>
      )}

      {/* Grid of Previews and Active Uploads */}
      {(media.length > 0 || Object.keys(activeUploads).length > 0) && (
        <div className="uploader-grid">
          
          {/* 1. Uploaded Verified Media Cards */}
          {media.map((item, index) => {
            const isCover = index === 0 || item.isCover;
            const imageUrl = item.secure_url || item.url;

            return (
              <div
                key={item.publicId || item.public_id || index}
                className={`uploader-card ${isCover ? 'is-cover' : ''}`}
              >
                {/* Slot Number & Cover Badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    Image {index + 1} of 3
                  </span>
                  {isCover && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-xs">
                      ★ Cover
                    </span>
                  )}
                </div>

                {/* Image */}
                <img
                  src={imageUrl}
                  alt={`Listing image ${index + 1} of 3`}
                  className="uploader-card-image cursor-pointer"
                  onClick={() => setLightboxUrl(imageUrl)}
                  loading="lazy"
                />

                {/* Card Hover Action Bar */}
                <div className="uploader-card-actions">
                  
                  {/* Top Bar: Delete & Lightbox */}
                  <div className="uploader-top-actions">
                    <button
                      type="button"
                      title="Enlarge preview"
                      onClick={() => setLightboxUrl(imageUrl)}
                      className="uploader-btn-icon"
                    >
                      🔍
                    </button>
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => handleRemove(index)}
                      className="uploader-btn-icon btn-delete"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Bottom Bar: Set Cover & Reorder */}
                  <div className="uploader-bottom-actions">
                    <button
                      type="button"
                      title={isCover ? 'Primary Cover Photo' : 'Set as Cover Photo'}
                      onClick={() => handleSetCover(index)}
                      className={`uploader-btn-icon btn-star ${isCover ? 'active' : ''}`}
                    >
                      ★
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move left"
                        disabled={index === 0}
                        onClick={() => handleMove(index, index - 1)}
                        className="uploader-btn-icon"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        title="Move right"
                        disabled={index === media.length - 1}
                        onClick={() => handleMove(index, index + 1)}
                        className="uploader-btn-icon"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* 2. Actively Uploading or Failed Cards in Queue */}
          {Object.entries(activeUploads).map(([uploadId, upload]) => {
            const hasError = Boolean(upload.error);

            return (
              <div key={uploadId} className="uploader-card">
                <img
                  src={upload.previewUrl}
                  alt="Uploading..."
                  className="uploader-card-image opacity-60 filter blur-[1px]"
                />

                {hasError ? (
                  <div className="uploader-overlay-error">
                    <span className="text-xl">⚠️</span>
                    <div className="uploader-error-text">{upload.error}</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRetry(uploadId)}
                        className="uploader-retry-btn"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissUpload(uploadId)}
                        className="uploader-retry-btn bg-black/40 text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="uploader-overlay-progress">
                    <div className="uploader-progress-text">
                      Uploading {upload.progress}%
                    </div>
                    <div className="uploader-progress-bar-container">
                      <div
                        className="uploader-progress-bar-fill"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div className="uploader-lightbox" onClick={() => setLightboxUrl(null)}>
          <div className="uploader-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="uploader-lightbox-close"
              onClick={() => setLightboxUrl(null)}
            >
              ✕
            </button>
            <img src={lightboxUrl} alt="Enlarged preview" className="uploader-lightbox-img" />
          </div>
        </div>
      )}

    </div>
  );
}

export default ListingImageUploader;
