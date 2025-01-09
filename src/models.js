const mongoose = require("mongoose");

const failedRequestSchema = new mongoose.Schema({
  ip: String,
  reason: String,
  failCountInTimeWindow: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FailedRequest", failedRequestSchema);
