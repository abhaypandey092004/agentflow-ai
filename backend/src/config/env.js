require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    mockMode: process.env.OPENAI_MOCK_MODE === 'true',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  cors: {
    origins: (process.env.FRONTEND_URLS || 'http://localhost:5173,http://localhost:5174').split(','),
  }
};
