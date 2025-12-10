const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = {};
  errors.array().forEach(err => {
    if (!extractedErrors[err.param]) {
      extractedErrors[err.param] = err.msg;
    }
  });
  
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors
  });
};
