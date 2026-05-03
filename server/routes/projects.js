const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projects');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getProjects);
router.post('/', authorize('admin'), createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', authorize('admin'), deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
