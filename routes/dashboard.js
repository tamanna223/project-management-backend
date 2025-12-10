const express = require('express');
const { 
  getDashboardStats,
  getProjectStats
} = require('../controllers/dashboardController');
const { isAuthenticatedUser } = require('../middleware/auth');
const { param } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected and require authentication
router.use(isAuthenticatedUser);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns overall statistics including task counts, completion rates, and upcoming deadlines
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of tasks
 *                       example: 15
 *                     completed:
 *                       type: integer
 *                       description: Number of completed tasks
 *                       example: 7
 *                     inProgress:
 *                       type: integer
 *                       description: Number of tasks in progress
 *                       example: 5
 *                     todo:
 *                       type: integer
 *                       description: Number of tasks to do
 *                       example: 3
 *                     highPriority:
 *                       type: integer
 *                       description: Number of high priority tasks
 *                       example: 4
 *                     dueThisWeek:
 *                       type: integer
 *                       description: Number of tasks due this week
 *                       example: 2
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /dashboard/projects/{projectId}/stats:
 *   get:
 *     summary: Get project-specific statistics
 *     description: Returns statistics for a specific project including task counts by status
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to get statistics for
 *     responses:
 *       200:
 *         description: Project statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Task status
 *                         example: "in-progress"
 *                       count:
 *                         type: integer
 *                         description: Number of tasks with this status
 *                         example: 3
 *       404:
 *         description: Project not found
 *       400:
 *         description: Invalid project ID
 *       403:
 *         description: Not authorized to access this project
 */
router.get(
  '/projects/:projectId/stats', 
  [
    param('projectId')
      .isMongoId()
      .withMessage('Invalid project ID')
  ],
  validate,
  getProjectStats
);

module.exports = router;
