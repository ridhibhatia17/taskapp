const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  getComments
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router({ mergeParams: true }); 
// mergeParams: true allows access to :projectId when mounted under /api/projects/:projectId/tasks

router.route('/')
  .get(protect, getTasks)
  .post(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      validate
    ],
    createTask
  );

// These routes don't necessarily need projectId in the URL if we hit them directly via /api/tasks/:id
// But we can mount them under /api/tasks
router.route('/:id')
  .put(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      validate
    ],
    updateTask
  )
  .delete(protect, deleteTask);

router.patch(
  '/:id/status',
  protect,
  [
    body('status', 'Status is required').not().isEmpty(),
    validate
  ],
  updateTaskStatus
);

router.route('/:id/comments')
  .get(protect, getComments)
  .post(
    protect,
    [
      body('message', 'Message is required').not().isEmpty(),
      validate
    ],
    addComment
  );

module.exports = router;
