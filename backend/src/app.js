const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const rateLimiter = require("./middleware/rateLimiter");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = env.cors.origins;

// Security middlewares
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// ✅ FIX: OPTIONS request manually handle karo
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter
app.use("/api", rateLimiter);

// Health check
app.get("/api/health", async (req, res) => {
  const redisConnection = require('./config/redis');
  const supabase = require('./config/supabase');
  
  let redisStatus = 'connected';
  let supabaseStatus = 'connected';

  try {
    await redisConnection.ping();
  } catch (err) {
    redisStatus = 'disconnected';
  }

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
  } catch (err) {
    supabaseStatus = 'disconnected';
  }

  const isHealthy = redisStatus === 'connected' && supabaseStatus === 'connected';
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    services: {
      redis: redisStatus,
      supabase: supabaseStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
const agentRoutes = require("./routes/agent.routes");
const workflowRoutes = require("./routes/workflow.routes");
const executionRoutes = require("./routes/execution.routes");
const uploadRoutes = require("./routes/upload.routes");
const exportRoutes = require("./routes/export.routes");
const templateRoutes = require("./routes/template.routes");

app.use("/api/agents", agentRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/templates", templateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;