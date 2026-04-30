const Redis = require('ioredis');
const env = require('./env');

const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Add TLS for Upstash (rediss://)
if (env.redis.url.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false
  };
}

const redisConnection = new Redis(env.redis.url, redisOptions);

redisConnection.on('connect', () => {
  console.log('Redis connected successfully to:', env.redis.url.split('@').pop());
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisConnection;
