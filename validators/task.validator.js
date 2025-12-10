const { body, param } = require('express-validator');

exports.createTaskValidation = [
  body('title')
    .not().isEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 to 100 characters'),
  
  body('description')
    .not().isEmpty().withMessage('Description is required')
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status value'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),
  
  body('dueDate')
    .not().isEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('project')
    .not().isEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID')
];

exports.updateTaskValidation = [
  param('id')
    .isMongoId().withMessage('Invalid task ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 to 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status value'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),
  
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

exports.taskIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid task ID')
];
