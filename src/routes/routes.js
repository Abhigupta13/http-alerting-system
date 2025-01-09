const express = require("express");
const { monitorRequest, fetchMetrics } = require("../services/monitorService");
const router = express.Router();

router.post("/api/submit", monitorRequest);
router.get("/api/metrics", fetchMetrics);

module.exports = router;
