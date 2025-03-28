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

    const recipientEmail = "nr_benkradidja@esi.dz"; // Change to actual recipient
    const emailSubject = `🔧 New Intervention Request: ${title}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f8f9fa; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="background: #007bff; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px;">🚨 New Intervention Request</h2>
        
        <p style="font-size: 16px; color: #333;">A new intervention request has been submitted. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold; width: 30%;">📌 Title</td>
            <td style="background: #f1f1f1; padding: 10px;">${title}</td>
          </tr>
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold;">📝 Description</td>
            <td style="background: #f1f1f1; padding: 10px;">${description}</td>
          </tr>
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold;">📍 Localisation</td>
            <td style="background: #f1f1f1; padding: 10px;">${localisation}</td>
          </tr>
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold;">⚠ Priority</td>
            <td style="background: #f1f1f1; padding: 10px;">${priority}</td>
          </tr>
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold;">🔧 Equipment ID</td>
            <td style="background: #f1f1f1; padding: 10px;">${equipment_id}</td>
          </tr>
          <tr>
            <td style="background: #007bff; color: white; padding: 10px; font-weight: bold;">📷 Picture</td>
            <td style="background: #f1f1f1; padding: 10px;">
              <a href="${picture}" style="color: #007bff; text-decoration: none; font-weight: bold;">View Image</a>
            </td>
          </tr>
        </table>

        <p style="text-align: center; margin-top: 20px;">
          <a href="#" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">🔍 View Request</a>
        </p>

        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
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
