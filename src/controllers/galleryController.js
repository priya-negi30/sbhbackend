const { GalleryImage } = require('../models');
const { toAbsoluteUrl } = require('../utils/helpers');
const { del } = require('@vercel/blob');
const makeUploader = require('../middleware/upload');

// Instantiate the gallery uploader helper instance
const galleryUploader = makeUploader('gallery');

function serialize(req, image) {
  const g = image.toJSON();
  // If g.url is already a full Vercel Blob URL, return as-is.
  // Otherwise, fall back to toAbsoluteUrl for relative legacy paths.
  if (g.url && !g.url.startsWith('http://') && !g.url.startsWith('https://')) {
    g.url = toAbsoluteUrl(req, g.url);
  }
  return g;
}

// Public: GET /api/gallery (optional ?category=Hospital filter)
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    const images = await GalleryImage.findAll({ where, order: [['sort_order', 'ASC'], ['id', 'ASC']] });
    res.json(images.map((g) => serialize(req, g)));
  } catch (err) {
    next(err);
  }
};

exports.categories = async (req, res, next) => {
  try {
    const images = await GalleryImage.findAll({ attributes: ['category'], group: ['category'] });
    res.json(images.map((i) => i.category));
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/gallery (supports single or multiple file uploads via Vercel Blob)
exports.create = async (req, res, next) => {
  try {
    const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ message: 'At least one image file is required' });

    const { title, category, sort_order } = req.body;

    const created = await Promise.all(
      files.map(async (file, idx) => {
        // Upload each memory buffer to Vercel Blob
        const blobUrl = await galleryUploader.uploadToBlob(file);

        return GalleryImage.create({
          title: title || file.originalname,
          category: category || 'General',
          sort_order: sort_order ? Number(sort_order) + idx : 0,
          url: blobUrl,
        });
      })
    );

    res.status(201).json(created.map((g) => serialize(req, g)));
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/gallery/:id (update title/category, optionally replace image)
exports.update = async (req, res, next) => {
  try {
    const image = await GalleryImage.findByPk(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    if (req.body.title !== undefined) image.title = req.body.title;
    if (req.body.category !== undefined) image.category = req.body.category;
    if (req.body.sort_order !== undefined) image.sort_order = req.body.sort_order;

    if (req.file) {
      // Delete old image from Vercel Blob if it exists
      if (image.url && (image.url.includes('vercel-storage.com') || image.url.startsWith('http'))) {
        try {
          await del(image.url);
        } catch (delErr) {
          console.error('Failed to delete old blob:', delErr.message);
        }
      }

      // Upload replacement file to Vercel Blob
      image.url = await galleryUploader.uploadToBlob(req.file);
    }

    await image.save();
    res.json(serialize(req, image));
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/gallery/:id
exports.remove = async (req, res, next) => {
  try {
    const image = await GalleryImage.findByPk(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // Delete image from Vercel Blob
    if (image.url && (image.url.includes('vercel-storage.com') || image.url.startsWith('http'))) {
      try {
        await del(image.url);
      } catch (delErr) {
        console.error('Failed to delete blob on removal:', delErr.message);
      }
    }

    await image.destroy();
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    next(err);
  }
};