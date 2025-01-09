const FailedRequest = require("../models/models");
const { sendAlert } = require("../alertService");

const failedRequests = new Map(); // In-memory tracking for quick threshold checks

function getClientIPv4(req) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

  if (!ip) return null;

  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", ""); 
  }

  return ip; 
}

async function monitorRequest(req, res) {
  try {
    const ip = getClientIPv4(req);
    const authHeader = req.headers["authorization"];
    const authToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // Check for missing or invalid token
    if (!authToken || authToken !== "VALID_TOKEN") {
      const reason = authToken ? "Invalid Token" : "Missing Token";

      // Log the failed request and update failure count
      await logFailedRequest(ip, reason);
      const failures = updateFailureCount(ip);

      // Trigger alert if the threshold is breached
      if (failures >= parseInt(process.env.THRESHOLD, 10)) {
        try {
          await sendAlert("abhishek.akg13@gmail.com", ip);
          console.log(`Alert triggered for IP: ${ip}`);
        } catch (alertError) {
          console.error(`Failed to send alert: ${alertError.message}`);
        }
      }

      return res.status(401).json({ error: reason });
    }

    res.status(200).json({ message: "Request successful" });
  } catch (error) {
    console.error(`Error in monitorRequest: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



async function logFailedRequest(ip, reason) {
    try {
      const now = Date.now();
      const timeWindow = parseInt(process.env.TIME_WINDOW, 10) * 60000;
  
      // Check for existing failed requests from the same IP and reason within the time window
      const existingRequest = await FailedRequest.findOne({
        ip,
        timestamp: { $gte: new Date(now - timeWindow) },
      });
  
      if (existingRequest) {
        // Increment fail count
        existingRequest.failCountInTimeWindow += 1;
        await existingRequest.save();
        console.log(
          `Updated failCountInTimeWindow for IP: ${ip}. New count: ${existingRequest.failCountInTimeWindow}`
        );
      } else {
        // Create a new failed request log
        const newRequest = new FailedRequest({ ip, reason });
        await newRequest.save();
        console.log(`Logged new failed request from IP: ${ip} with reason: ${reason}`);
      }
    } catch (error) {
      console.error(`Error logging failed request for IP: ${ip}. Error: ${error.message}`);
    }
  }
  

function updateFailureCount(ip) {
  try {
    const now = Date.now();
    const timeWindow = parseInt(process.env.TIME_WINDOW, 10) * 60000;

    if (!failedRequests.has(ip)) failedRequests.set(ip, []);
    const timestamps = failedRequests.get(ip);

    // Filter timestamps within the window
    const validTimestamps = timestamps.filter(ts => now - ts <= timeWindow);
    validTimestamps.push(now);

    failedRequests.set(ip, validTimestamps);
    console.log(`Failure count for IP: ${ip} updated to: ${validTimestamps.length}`);
    return validTimestamps.length;
  } catch (error) {
    console.error(`Error updating failure count for IP: ${ip}. Error: ${error.message}`);
    return 0; // Default to 0 in case of an error
  }
}

async function fetchMetrics(req, res) {
    try {
      // Fetch all failed request logs
      const metrics = await FailedRequest.find({}, { _id: 0, ip: 1, reason: 1, failCountInTimeWindow: 1, timestamp: 1 });
      res.status(200).json(metrics);
    } catch (error) {
      console.error(`Error fetching metrics: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch metrics. Please try again later." });
    }
  }
  

module.exports = { monitorRequest, fetchMetrics };
