const env = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
