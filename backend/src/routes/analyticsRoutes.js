const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAnalytics);

module.exports = router;
