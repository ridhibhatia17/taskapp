const express = require('express');
const { searchUsers } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search', protect, admin, searchUsers);

module.exports = router;
