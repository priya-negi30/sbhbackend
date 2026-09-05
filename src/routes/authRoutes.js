const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.me);
router.post('/change-password', auth, ctrl.changePassword);

module.exports = router;
