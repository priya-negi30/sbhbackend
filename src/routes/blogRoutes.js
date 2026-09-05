const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const makeUploader = require('../middleware/upload');
const ctrl = require('../controllers/blogController');

const upload = makeUploader('blogs');

// Public
router.get('/', ctrl.list);
router.get('/id/:id', ctrl.getOne); // fetch by numeric id (used by admin edit form)
router.get('/:permalink', ctrl.getByPermalink); // fetch by slug (used by public site)

// Admin (protected)
router.post('/', auth, upload.single('image'), ctrl.create);
router.put('/:id', auth, upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
