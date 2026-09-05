const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/jobController');

// Admin (protected)
router.get('/', auth, ctrl.listAllApplications);
router.patch('/:id/status', auth, ctrl.updateApplicationStatus);

module.exports = router;
