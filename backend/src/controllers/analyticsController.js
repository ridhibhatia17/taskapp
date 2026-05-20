const prisma = require('../config/db');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Top-level stats
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'COMPLETED' } });
    const pendingTasks = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } });
    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' }
      }
    });

    // 2. Status Distribution (Pie Chart)
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    const statusDistribution = tasksByStatus.map(t => ({
      name: t.status,
      value: t._count.id
    }));

    // 3. Task Completion by Priority (Bar Chart)
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: { id: true }
    });
    
    const priorityDistribution = tasksByPriority.map(t => ({
      name: t.priority,
      value: t._count.id
    }));

    // 4. Upcoming Deadlines
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        dueDate: { gte: new Date() },
        status: { not: 'COMPLETED' }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { project: { select: { title: true } } }
    });

    // 5. Recent Activity
    const recentProjects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true, creator: { select: { name: true } } }
    });
    
    const recentTasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true, project: { select: { title: true } } }
    });

    const recentActivity = [
      ...recentProjects.map(p => ({ type: 'project', data: p, date: p.createdAt })),
      ...recentTasks.map(t => ({ type: 'task', data: t, date: t.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks
      },
      charts: {
        statusDistribution,
        priorityDistribution
      },
      upcomingDeadlines,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics
};
