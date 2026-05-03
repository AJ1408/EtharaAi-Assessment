const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check if user has access to a project
const hasProjectAccess = async (projectId, userId, userRole) => {
  if (userRole === 'admin') return true;
  const project = await Project.findById(projectId);
  if (!project) return false;
  return (
    project.owner.toString() === userId ||
    project.members.some((m) => m.user.toString() === userId)
  );
};

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { project, assignee, status, priority, search, overdue } = req.query;
    let filter = {};

    if (project) filter.project = project;
    if (assignee) filter.assignee = assignee;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'done' };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Members only see tasks from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      filter.project = filter.project
        ? (projectIds.map(String).includes(filter.project) ? filter.project : null)
        : { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color owner members')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const access = await hasProjectAccess(task.project._id, req.user.id, req.user.role);
    if (!access) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate, tags, estimatedHours } = req.body;

    if (!title || !project) {
      return res.status(400).json({ success: false, message: 'Title and project are required' });
    }

    const access = await hasProjectAccess(project, req.user.id, req.user.role);
    if (!access) return res.status(403).json({ success: false, message: 'Access denied to this project' });

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags,
      estimatedHours,
      createdBy: req.user.id,
    });

    await task.populate([
      { path: 'project', select: 'name color' },
      { path: 'assignee', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate('project', 'owner members');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const access = await hasProjectAccess(task.project._id, req.user.id, req.user.role);
    if (!access) return res.status(403).json({ success: false, message: 'Access denied' });

    const { title, description, assignee, status, priority, dueDate, tags, estimatedHours, actualHours, order } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignee, status, priority, dueDate, tags, estimatedHours, actualHours, order },
      { new: true, runValidators: true }
    )
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name avatar');

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'owner members');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const access = await hasProjectAccess(task.project._id, req.user.id, req.user.role);
    if (!access) return res.status(403).json({ success: false, message: 'Access denied' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const task = await Task.findById(req.params.id).populate('project', 'owner members');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const access = await hasProjectAccess(task.project._id, req.user.id, req.user.role);
    if (!access) return res.status(403).json({ success: false, message: 'Access denied' });

    task.comments.push({ author: req.user.id, text });
    await task.save();
    await task.populate('comments.author', 'name avatar');

    res.status(201).json({ success: true, data: task.comments[task.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
