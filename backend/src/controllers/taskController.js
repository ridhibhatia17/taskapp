const prisma = require('../config/db');

// Helper function to check if user has access to project
const checkProjectAccess = async (projectId, userId, role) => {
  if (role === 'ADMIN') return true;
  
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId }
    }
  });
  return !!member;
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const hasAccess = await checkProjectAccess(projectId, req.user.id, req.user.role);
    
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, dueDate, assigneeIds } = req.body;

    const hasAccess = await checkProjectAccess(projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        createdBy: req.user.id,
      }
    });

    // Assign members if provided
    if (assigneeIds && assigneeIds.length > 0) {
      const memberData = assigneeIds.map(userId => ({
        taskId: task.id,
        userId
      }));
      await prisma.taskMember.createMany({ data: memberData });
    }

    const createdTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { comments: true } }
      }
    });

    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, priority, status, dueDate, assigneeIds } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized to access this task');
    }

    // Update basic task details
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    // If assigneeIds is provided, update members (delete existing, create new)
    if (assigneeIds !== undefined) {
      await prisma.taskMember.deleteMany({ where: { taskId } });
      if (assigneeIds.length > 0) {
        const memberData = assigneeIds.map(userId => ({ taskId, userId }));
        await prisma.taskMember.createMany({ data: memberData });
      }
    }

    const finalTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { comments: true } }
      }
    });

    res.json(finalTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status only (for drag and drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { comments: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized');
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { message } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: req.user.id,
        message
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a task
// @route   GET /api/tasks/:id/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const hasAccess = await checkProjectAccess(task.projectId, req.user.id, req.user.role);
    if (!hasAccess) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  getComments
};
