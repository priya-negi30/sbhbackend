const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const makeUploader = require('../middleware/upload');
const ctrl = require('../controllers/doctorController');

const upload = makeUploader('doctors');

// Public
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

// Admin (protected)
router.post('/', auth, upload.single('image'), ctrl.create);
router.put('/:id', auth, upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
