const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Middleware to send an email notification.
 * Usage: Call `next()` after sending the email to continue the request.
 */const sendEmail = async (req, res, next) => {
  try {
    const { title, description, localisation, priority, equipment_id, picture } = req.body;

    if (!title || !description || !localisation || !priority || !equipment_id || !picture) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const recipientEmail = "m_abbas@esi.dz"; // Change to actual recipient
    const emailSubject = `🔧 New Intervention Request: ${title}`;
    
    const emailBody = `<div style="font-family: 'Inter', Arial, sans-serif; max-width: 620px; margin: auto; background: #f9fafb; padding: 24px; border-radius: 12px; box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
  <h2 style="background: #4f46e5; color: white; padding: 18px 24px; text-align: center; border-radius: 12px 12px 0 0; margin: -24px -24px 24px; font-size: 20px;">
    🚨 New Intervention Request
  </h2>

  <p style="font-size: 16px; color: #111827; margin-bottom: 16px;">
    A new intervention request has been submitted. Here are the details:
  </p>

  <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">📌 Title</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">${title}</td>
    </tr>
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">📝 Description</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">${description}</td>
    </tr>
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">📍 Localisation</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">${localisation}</td>
    </tr>
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">⚠ Priority</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">${priority}</td>
    </tr>
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">🔧 Equipment ID</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">${equipment_id}</td>
    </tr>
    <tr>
      <td style="background: #4f46e5; color: white; padding: 12px 16px; font-weight: 600; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">📷 Picture</td>
      <td style="background: #eef2ff; padding: 12px 16px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">
        <a href="${picture}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">View Image</a>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-top: 32px;">
    <a href="#" style="background: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
      🔍 View Request
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px;">
    This is an automated notification. Please do not reply.
  </p>
</div>
`;

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Email sent successfully!");
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};


module.exports = sendEmail;
