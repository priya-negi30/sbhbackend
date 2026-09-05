const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const makeUploader = require('../middleware/upload');
const ctrl = require('../controllers/galleryController');

const upload = makeUploader('gallery');

// Public
router.get('/', ctrl.list);
router.get('/categories', ctrl.categories);

// Admin (protected) - supports up to 20 images in one request via field "images"
router.post('/', auth, upload.array('images', 20), ctrl.create);
router.put('/:id', auth, upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
