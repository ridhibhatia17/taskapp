const prisma = require('../config/db');

// @desc    Search users by email
// @route   GET /api/users/search
// @access  Private/Admin
const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
};
