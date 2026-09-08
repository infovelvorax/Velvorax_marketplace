import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    // Sanitize filename to prevent directory traversal
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function checkFileType(file, cb) {
  const allowedExtensions = /^\.(jpg|jpeg|png|webp|mp4)$/i;
  const allowedMimeTypes = /^(image\/(jpeg|jpg|png|webp)|video\/mp4)$/i;

  const ext = path.extname(file.originalname).toLowerCase();
  const extValid = allowedExtensions.test(ext);
  const mimeValid = allowedMimeTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP images and MP4 videos (up to 2MB) are allowed.'));
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max per file
    files: 3 // Max 3 files per upload request
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export const uploadFiles = (req, res) => {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `${protocol}://${host}`;

    if (!req.files || req.files.length === 0) {
      if (req.file) {
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
        return res.json({
          success: true,
          url: fileUrl,
          urls: [fileUrl],
          data: [fileUrl]
        });
      }
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
    res.json({
      success: true,
      urls: fileUrls,
      data: fileUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
