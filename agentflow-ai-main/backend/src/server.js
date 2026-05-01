const app = require('./app');
const env = require('./config/env');

const http = require('http');
const { initSocket } = require('./socket');

const PORT = env.port;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Workflow Worker
require('./queues/workflow.worker');

// Verify Redis Connection before starting
const redisConnection = require('./config/redis');

server.listen(PORT, async () => {
  console.log(`🚀 Server running in ${env.nodeEnv} mode on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  
  try {
    await redisConnection.ping();
    console.log('✅ Redis connectivity verified');
  } catch (err) {
    console.error('❌ Redis validation failed:', err.message);
  }
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed');
    await redisConnection.quit();
    console.log('Redis connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});
