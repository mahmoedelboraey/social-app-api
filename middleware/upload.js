const multer = require('multer');
const imagekit = require('../config/imagekit');
const AppError = require('../utils/AppError');
// Store files in memory (buffer) before uploading to ImageKit
const storage = multer.memoryStorage();
// Accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});
// ─── uploadOnImageKit: uploads buffer to ImageKit ────────────────────────────
const uploadOnImageKit = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one image.', 400));
    }

    const uploadPromises = req.files.map((file) => {
      return imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: '/blog-app/posts',
      });
    });

    const results = await Promise.all(uploadPromises);
    // Attach URLs to req for the controller to use
    req.imageUrls = results.map((result) => result.url);
    next();
  } catch (error) {
    return next(new AppError(`Image upload failed: ${error.message}`, 500));
  }
};

// Multer middleware: accept up to 5 images under field "images"
const uploadImages = upload.array('images', 5);

module.exports = { uploadImages, uploadOnImageKit };
