const env = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  // Always log the full error for debugging on the server
  console.error(`[ERROR] ${err.name}: ${err.message}\n${err.stack}`);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  
  // In production, don't leak specific error details unless they are intentional
  const message = (isProduction && statusCode === 500) 
    ? 'An unexpected error occurred. Please try again later.' 
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack, details: err })
  });
};

module.exports = errorMiddleware;
