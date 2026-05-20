const prisma = require('../config/db');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          creator: { select: { name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId: req.user.id },
          },
        },
        include: {
          creator: { select: { name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            members: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is admin or a member
    if (req.user.role !== 'ADMIN') {
      const isMember = project.members.some((m) => m.userId === req.user.id);
      if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to access this project');
      }
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;

    let project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add members to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMembers = async (req, res, next) => {
  try {
    const { userIds } = req.body; // Array of user IDs

    if (!userIds || userIds.length === 0) {
      res.status(400);
      throw new Error('No users provided');
    }

    const projectId = req.params.id;

    // Filter out existing members to avoid unique constraint errors
    const existingMembers = await prisma.projectMember.findMany({
      where: { projectId },
    });
    const existingUserIds = existingMembers.map(m => m.userId);

    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length > 0) {
      const data = newUserIds.map((userId) => ({
        projectId,
        userId,
      }));

      await prisma.projectMember.createMany({
        data,
      });
    }

    res.status(201).json({ message: 'Members added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      res.status(404);
      throw new Error('Member not found in this project');
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    res.json({ message: 'Member removed from project' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
};
