const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("./middleware/rateLimiter");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// Security middlewares
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked Origin:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle OPTIONS preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter
app.use("/api", rateLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running"
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