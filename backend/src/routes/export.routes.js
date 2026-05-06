const express = require("express");
const router = express.Router();

const exportController = require("../controllers/export.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { exportLimiter } = require("../middleware/rateLimiter");

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Export route is working",
  });
});

router.use(authMiddleware);

router.post("/pdf", exportLimiter, exportController.exportPdf);
router.post("/docx", exportLimiter, exportController.exportDocx);

module.exports = router;