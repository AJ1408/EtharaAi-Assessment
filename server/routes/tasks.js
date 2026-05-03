const express = require('express');
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, addComment } = require('../controllers/tasks');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
