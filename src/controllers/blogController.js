const { Blog } = require('../models');
const { toAbsoluteUrl, parseMaybeJson } = require('../utils/helpers');
const { del } = require('@vercel/blob');
const makeUploader = require('../middleware/upload');

// Instantiate the blog uploader helper instance
const blogUploader = makeUploader('blogs');

function serialize(req, blog) {
  const b = blog.toJSON();
  // Return full Vercel Blob URLs directly, fallback to toAbsoluteUrl for legacy relative paths
  if (b.image && !b.image.startsWith('http://') && !b.image.startsWith('https://')) {
    b.image = toAbsoluteUrl(req, b.image);
  }
  return b;
}

// Public: GET /api/blogs (?category=Eye Care, ?all=true for admin drafts too)
exports.list = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { status: 'published' };
    if (req.query.category) where.category = req.query.category;
    const blogs = await Blog.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(blogs.map((b) => serialize(req, b)));
  } catch (err) {
    next(err);
  }
};

// Public: GET /api/blogs/:permalink
exports.getByPermalink = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ where: { permalink: req.params.permalink } });
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.json(serialize(req, blog));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    res.json(serialize(req, blog));
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/blogs
exports.create = async (req, res, next) => {
  try {
    const body = req.body;

    // Handle image upload to Vercel Blob if a file was provided
    let imageUrl = body.image || null;
    if (req.file) {
      imageUrl = await blogUploader.uploadToBlob(req.file);
    }

    const blog = await Blog.create({
      permalink: body.permalink,
      title: body.title,
      category: body.category,
      author: body.author,
      author_role: body.author_role,
      date: body.date,
      excerpt: body.excerpt,
      author_image: body.author_image,
      tags: parseMaybeJson(body.tags, []),
      meta: parseMaybeJson(body.meta, {}),
      content: parseMaybeJson(body.content, []),
      status: body.status || 'published',
      image: imageUrl,
    });

    res.status(201).json(serialize(req, blog));
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/blogs/:id
exports.update = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });
    const body = req.body;

    const fields = ['permalink', 'title', 'category', 'author', 'author_role', 'date', 'excerpt', 'author_image', 'status'];
    fields.forEach((f) => {
      if (body[f] !== undefined) blog[f] = body[f];
    });
    if (body.tags !== undefined) blog.tags = parseMaybeJson(body.tags, blog.tags);
    if (body.meta !== undefined) blog.meta = parseMaybeJson(body.meta, blog.meta);
    if (body.content !== undefined) blog.content = parseMaybeJson(body.content, blog.content);

    if (req.file) {
      // Remove old Vercel Blob image if it exists
      if (blog.image && (blog.image.includes('vercel-storage.com') || blog.image.startsWith('http'))) {
        try {
          await del(blog.image);
        } catch (delErr) {
          console.error('Failed to delete old blob:', delErr.message);
        }
      }

      // Upload replacement image to Vercel Blob
      blog.image = await blogUploader.uploadToBlob(req.file);
    }

    await blog.save();
    res.json(serialize(req, blog));
  } catch (err) {
    next(err);
  }
};

// Admin: DELETE /api/blogs/:id
exports.remove = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found' });

    // Remove image from Vercel Blob
    if (blog.image && (blog.image.includes('vercel-storage.com') || blog.image.startsWith('http'))) {
      try {
        await del(blog.image);
      } catch (delErr) {
        console.error('Failed to delete blob on removal:', delErr.message);
      }
    }

    await blog.destroy();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    next(err);
  }
};