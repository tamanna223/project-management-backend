const { body } = require('express-validator');
const User = require('../models/User');

exports.registerValidation = [
  body('name')
    .not().isEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 to 50 characters')
    .escape(),
  
  body('email')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email already in use');
      }
    }),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .trim()
];

exports.loginValidation = [
  body('email')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),
  
  body('password')
    .exists().withMessage('Password is required')
    .not().isEmpty().withMessage('Password cannot be empty')
];
