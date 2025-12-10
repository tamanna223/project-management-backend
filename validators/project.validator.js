const { body, param } = require('express-validator');

exports.createProjectValidation = [
  body('title')
    .not().isEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 to 100 characters'),
  
  body('description')
    .not().isEmpty().withMessage('Description is required')
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
];

exports.updateProjectValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 to 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
];

exports.projectIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID')
];
