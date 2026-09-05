const multer = require('multer');
const path = require('path');
const { put } = require('@vercel/blob');

/**
 * Creates a multer instance for Vercel Blob compatibility
 * Keeps memory storage and adds a helper function to push buffers directly to Vercel Blob
 */
function makeUploader(folder, { allowDocs = false } = {}) {
  // Use memory storage to prevent local disk read-only errors on Vercel
  const storage = multer.memoryStorage();

  const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
  const docTypes = /pdf|doc|docx/;

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isImage = imageTypes.test(ext);
    const isDoc = allowDocs && docTypes.test(ext);

    if (isImage || isDoc) return cb(null, true);

    cb(
      new Error(
        allowDocs
          ? 'Only image (jpg, png, gif, webp, svg) or document (pdf, doc, docx) files are allowed'
          : 'Only image files (jpg, png, gif, webp, svg) are allowed'
      )
    );
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  });

  /**
   * Helper utility to upload memory buffer to Vercel Blob
   * @param {Object} file - Express file object from req.file
   * @returns {Promise<string>} - Public CDN URL of the uploaded file
   */
  upload.uploadToBlob = async (file) => {
    if (!file) throw new Error('No file provided for upload.');

    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 40);

    // Formats path as: uploads/<folder>/filename-timestamp.ext
    const blobPath = `uploads/${folder}/${base}-${Date.now()}${ext}`;

    const blob = await put(blobPath, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });

    return blob.url; // Returns the full URL (e.g., https://...public.blob.vercel-storage.com/...)
  };

  return upload;
}

module.exports = makeUploader;
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Creates a multer instance that stores files under uploads/<folder>
// function makeUploader(folder, { allowDocs = false } = {}) {
//   const dest = path.join(__dirname, '..', '..', 'uploads', folder);
//   if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, dest),
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const base = path
//         .basename(file.originalname, ext)
//         .replace(/[^a-zA-Z0-9-_]/g, '_')
//         .slice(0, 40);
//       cb(null, `${base}-${Date.now()}${ext}`);
//     },
//   });

//   const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
//   const docTypes = /pdf|doc|docx/;

//   const fileFilter = (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
//     const isImage = imageTypes.test(ext);
//     const isDoc = allowDocs && docTypes.test(ext);
//     if (isImage || isDoc) return cb(null, true);
//     cb(new Error(allowDocs
//       ? 'Only image (jpg, png, gif, webp, svg) or document (pdf, doc, docx) files are allowed'
//       : 'Only image files (jpg, png, gif, webp, svg) are allowed'));
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
//   });
// }

// module.exports = makeUploader;
