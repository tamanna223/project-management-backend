const express = require('express');
const { 
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject
} = require('../controllers/taskController');
const { isAuthenticatedUser } = require('../middleware/auth');
const { 
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation
} = require('../validators/task.validator');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected and require authentication
router.use(isAuthenticatedUser);

/**
 * @swagger
 * /tasks/project/{projectId}:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project not found
 */
router.get('/project/:projectId', getTasksByProject);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks with optional filtering
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, completed]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: dueBefore
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tasks due before this date (YYYY-MM-DD)
 *       - in: query
 *         name: dueAfter
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tasks due after this date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in task title or description
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.route('/')
  .get(getTasks)
  
  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Task'
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Project not found
   */
  .post(createTaskValidation, validate, createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       403:
 *         description: Not authorized to access this task
 */
router.route('/:id')
  .get(taskIdValidation, validate, getTask)
  
  /**
   * @swagger
   * /tasks/{id}:
   *   put:
   *     summary: Update a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Task'
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Task'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task not found
   *       403:
   *         description: Not authorized to update this task
   */
  .put([...taskIdValidation, ...updateTaskValidation], validate, updateTask)
  
  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   example: {}
   *       404:
   *         description: Task not found
   *       403:
   *         description: Not authorized to delete this task
   */
  .delete(taskIdValidation, validate, deleteTask);

module.exports = router;