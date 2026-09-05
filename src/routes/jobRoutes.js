const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const makeUploader = require('../middleware/upload');
const ctrl = require('../controllers/jobController');

const uploadResume = makeUploader('resumes', { allowDocs: true });

// Public
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/:id/apply', uploadResume.single('resume'), ctrl.apply);

// Admin (protected)
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.get('/:id/applications', auth, ctrl.listApplications);

module.exports = router;
