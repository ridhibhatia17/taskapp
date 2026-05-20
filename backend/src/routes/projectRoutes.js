const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
} = require('../controllers/projectController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getProjects)
  .post(
    protect,
    admin,
    [
      body('title', 'Title is required').not().isEmpty(),
      validate,
    ],
    createProject
  );

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(
    protect,
    admin,
    [
      body('title', 'Title is required').not().isEmpty(),
      validate,
    ],
    updateProject
  )
  .delete(protect, admin, deleteProject);

router
  .route('/:id/members')
  .post(
    protect,
    admin,
    [
      body('userIds', 'Please provide an array of user IDs').isArray(),
      validate,
    ],
    addMembers
  );

router.delete('/:id/members/:userId', protect, admin, removeMember);

module.exports = router;
