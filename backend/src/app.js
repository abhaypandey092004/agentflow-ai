const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const frontendUrls = [
  "https://agentflow-ai-fontend.onrender.com",
  "https://agentflow-ai-frontend.onrender.com",
  "http://localhost:5173",
];

const envFrontendUrls = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : [];

const allowedOrigins = [...new Set([...frontendUrls, ...envFrontendUrls])];

console.log("Allowed Origins:", allowedOrigins);

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).send("Backend is live");
});

app.get("/api/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health/worker", (req, res) => {
  try {
    const worker = require("./queues/workflow.worker");

    res.status(200).json({
      status: "ok",
      worker_initialized: !!worker,
      worker_running:
        typeof worker.isRunning === "function" ? worker.isRunning() : true,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Worker not initialized",
      error: err.message,
    });
  }
});

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

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

module.exports = app;