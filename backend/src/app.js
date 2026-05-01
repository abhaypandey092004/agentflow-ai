const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "").split(","),
]
  .map((url) => url?.trim())
  .filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://openrouter.ai", "https://*.supabase.co", "wss://*.supabase.co"]
      }
    } : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      // do NOT allow empty origin (server-to-server) unless explicitly allowed
      if (!origin) {
        return callback(new Error("CORS blocked: Origin required"));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Rate limiter
app.use("/api", apiLimiter);

// Root route (important for Render deployment verification)
app.get("/", (req, res) => {
  res.send("Backend is live");
});

// Health check route for production monitoring
app.get("/api/health", async (req, res) => {
  const supabase = require("./config/supabase");
  const redis = require("./config/redis");
  
  let dbStatus = "ok";
  let redisStatus = "ok";
  
  try {
    const { error } = await supabase.from("agents").select("id").limit(1);
    if (error) dbStatus = "error";
  } catch (e) { dbStatus = "error"; }
  
  try {
    await redis.ping();
  } catch (e) { redisStatus = "error"; }

  const status = (dbStatus === "ok" && redisStatus === "ok") ? 200 : 503;
  
  res.status(status).json({
    status: status === 200 ? "ok" : "degraded",
    database: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

// Worker health check
app.get("/api/health/worker", (req, res) => {
  try {
    const worker = require("./queues/workflow.worker");
    res.status(200).json({
      status: "ok",
      worker_initialized: !!worker,
      worker_running: worker.isRunning(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Worker not initialized",
      error: err.message
    });
  }
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
app.use("/api/documents", uploadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/templates", templateRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;