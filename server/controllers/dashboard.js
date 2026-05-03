const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Get accessible project IDs
    let projectFilter = {};
    if (!isAdmin) {
      const userProjects = await Project.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { project: { $in: projectIds } };
    }

    // Task stats
    const [totalTasks, todoCount, inProgressCount, reviewCount, doneCount, overdueCount] = await Promise.all([
      Task.countDocuments(projectFilter),
      Task.countDocuments({ ...projectFilter, status: 'todo' }),
      Task.countDocuments({ ...projectFilter, status: 'in-progress' }),
      Task.countDocuments({ ...projectFilter, status: 'review' }),
      Task.countDocuments({ ...projectFilter, status: 'done' }),
      Task.countDocuments({
        ...projectFilter,
        dueDate: { $lt: now },
        status: { $ne: 'done' },
      }),
    ]);

    // My tasks
    const myTasks = await Task.find({ assignee: userId, status: { $ne: 'done' } })
      .populate('project', 'name color')
      .sort({ dueDate: 1 })
      .limit(5);

    // Overdue tasks
    const overdueTasks = await Task.find({
      ...projectFilter,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    })
      .populate('project', 'name color')
      .populate('assignee', 'name avatar')
      .sort({ dueDate: 1 })
      .limit(5);

    // Recent tasks
    const recentTasks = await Task.find(projectFilter)
      .populate('project', 'name color')
      .populate('assignee', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(8);

    // Project stats
    let projectStats;
    if (isAdmin) {
      projectStats = {
        total: await Project.countDocuments({}),
        active: await Project.countDocuments({ status: 'active' }),
        completed: await Project.countDocuments({ status: 'completed' }),
      };
    } else {
      const userProjectIds = (
        await Project.find({
          $or: [{ owner: userId }, { 'members.user': userId }],
        }).select('_id status')
      );
      projectStats = {
        total: userProjectIds.length,
        active: userProjectIds.filter((p) => p.status === 'active').length,
        completed: userProjectIds.filter((p) => p.status === 'completed').length,
      };
    }

    // Users count (admin only)
    const userCount = isAdmin ? await User.countDocuments({}) : null;

    // Priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: projectFilter.project ? { project: { $in: projectFilter.project['$in'] } } : {} },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        tasks: { total: totalTasks, todo: todoCount, inProgress: inProgressCount, review: reviewCount, done: doneCount, overdue: overdueCount },
        projects: projectStats,
        userCount,
        myTasks,
        overdueTasks,
        recentTasks,
        priorityBreakdown,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
