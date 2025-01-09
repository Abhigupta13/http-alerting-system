const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use secure: true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test the transporter connection during setup to catch issues early
transporter.verify((error, success) => {
  if (error) {
    console.error("Error with SMTP configuration:", error.message);
  } else {
    console.log("SMTP server is ready to send emails.");
  }
});

async function sendAlert(email, ip) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "⚠️ Alert: Suspicious Activity Detected",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d32f2f; text-align: center;">⚠️ Suspicious Activity Alert</h2>
        <p>Dear User,</p>
        <p>We have detected multiple failed attempts to access the system from the following IP address:</p>
        <p style="font-weight: bold; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; display: inline-block;">
          ${ip}
        </p>
        <p>If this was not you, please investigate immediately or contact our support team for assistance.</p>
        <p style="margin-top: 20px;">Stay safe,</p>
        <p><strong>Your Security Team</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Alert email sent to ${email} for IP: ${ip}`);
  } catch (error) {
    console.error(`Failed to send email alert: ${error.message}`);
  }
}


module.exports = { sendAlert };
