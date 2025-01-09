# HTTP Alerting System

A Node.js-based alerting system for monitoring failed POST requests caused by invalid headers or incorrect access tokens. The system triggers email alerts when failed attempts from the same IP exceed a threshold.

## Features
- Monitors a specific POST endpoint for failed requests.
- Tracks and logs IPs, reasons for failure, and timestamps.
- Sends email alerts using Google's SMTP when thresholds are breached.
- Exposes an API to fetch metrics for analysis.

## Tech Stack
- **Node.js** (Backend)
- **Express.js** (Web Framework)
- **MongoDB** (Database)
- **Nodemailer** (Email Notifications)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alerting-system.git
   cd alerting-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```


4. Start the server using `nodemon`:
   ```bash
   npm start
   ```

## Alerting Flow
1. **Failed POST Requests Monitoring:**
   - The system monitors POST requests to the `/api/submit` endpoint.
   - If the request has an invalid or missing authorization token, it logs the failure with the IP address and the reason for failure.

2. **Tracking Failed Requests:**
   - The system tracks the number of failed requests from each IP address within a configurable time window (e.g., 10 minutes).
   - For each failure, the system checks if the IP has exceeded the threshold for failed attempts (e.g., 5 attempts).

3. **Alert Triggering:**
   - Once the threshold is exceeded for an IP, the system sends an email alert using Google's SMTP server to notify the admin about the suspicious activity.
   - The email includes the IP address and the number of failed attempts.

4. **Metrics Logging and Fetching:**
   - All failed request attempts are logged in MongoDB with details such as the IP address, reason, timestamp, and the number of failed attempts in the current time window.
   - An endpoint `/api/metrics` exposes the failed request metrics for analysis.

