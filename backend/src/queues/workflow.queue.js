const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

// Create the workflow execution queue
const workflowQueue = new Queue('workflow-execution', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = workflowQueue;
