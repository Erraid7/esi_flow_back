const { user } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/emailService"); // adjust path as needed
const { Op } = require("sequelize"); // Import Op for advanced queries

const createNotification = require("../utils/notifcationservice"); // Adjust path if needed

const registerPage = (req, res) => {
    res.send("Register Page");
};

//================================================================================================================
const registerUser = async (req, res) => {
    const {
      full_name,
      email,
      password,
      phone,
      bio,
      role,
      profession,
      sendEmailNotification,
    } = req.body;
    if (!full_name || !email || !password || !phone || !bio || !role || !profession) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const existingUser = await user.findOne({ 
        where: { email },
        attributes: ['id', 'email'] // Only fetch needed fields
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await user.create({
        full_name,
        email,
        password: hashedPassword,
        phone,
        bio,
        role,
        profession,
      });
      // Send response immediately
      res.status(201).json({ 
        message: "User created successfully", 
        user: newUser 
      });
  
      // Handle background tasks (email and notifications) after response
      Promise.all([
        // Task 1: Create welcome notification
        createNotification({
          recipientId: newUser.id,
          message: `👋 Welcome to our platform, ${full_name}! We''re excited to have you join us. Explore the features and let us know if you need any help.`,
          type: "Info",
          isRead: false
        }),
        
        // Task 2: Send email if needed
        (async () => {
          if (sendEmailNotification) {
            const subject = `📧 Welcome to the Platform! ${full_name}`;
          const htmlContent = `
 <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Platform</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4a5568; background-color: #f7fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #0D57AB; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 600;">Welcome to Our Platform</h1>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 40px 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 22px; font-weight: 600;">Dear Mr. ${full_name},</h2>
                    
                    <!-- Welcome message -->
                    <p style="margin: 0 0 25px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      Welcome to our platform! Your account has been successfully created.
                    </p>
                    
                    <!-- Login credentials -->
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #0D57AB; margin: 25px 0;">
                      <p style="margin: 0 0 15px 0; color: #2d3748; font-weight: 600; font-size: 16px;">Your login credentials:</p>
                      
                      <!-- Email -->
                      <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 120px; font-size: 14px;">Email Address:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px;">${email}</span>
                      </div>
                      
                      <!-- Password -->
                      <div style="padding: 12px 0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 120px; font-size: 14px;">Password:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px; font-family: monospace; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</span>
                      </div>
                    </div>
                    
                    <!-- Security notice -->
                    <div style="background-color: #fef3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.5;">
                        <strong>Security Notice:</strong> Please log in as soon as possible and change your password to ensure the security of your account.
                      </p>
                    </div>
                    
                    <!-- Closing -->
                    <p style="margin: 25px 0 8px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      Thank you for joining our platform.
                    </p>
                    
                    <p style="margin: 0; color: #718096; font-size: 15px; font-weight: 500;">
                      — Platform Team
                    </p>
                    
                    <!-- Action button -->
                    <div style="padding: 30px 0 10px 0; text-align: center;">
                      <a href="https://esi-flow.vercel.app/" style="display: inline-block; background-color: #0D57AB; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-size: 15px;">
                        Login to Platform
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 25px 20px; text-align: center; font-size: 12px; color: #a0aec0; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
              <p style="margin: 8px 0; line-height: 1.4;">This is an automatic notification. Please do not reply to this email.</p>
              <p style="margin: 8px 0; line-height: 1.4;">© 2025 Your Company. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
            return sendEmail(email, subject, htmlContent);
          }
        })()
      ]).catch(error => {
        console.error("Background task error:", error.message);
        // Log error but don't affect user response since it's already sen

      });
      
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  module.exports = registerUser;
//================================================================================================================

const loginPage = (req, res) => {
    res.send("Login Page");
};

const loginUser = async (req, res) => {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
        return res.status(401).json({ message: "Email or phone and password are required" });
    }

    try {
        const User = await user.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
        if (!User) {
            console.log("User not found");
            console.log(email);
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const isMatch = await bcrypt.compare(password, User.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const token = jwt.sign({ id: User.id, role: User.role}, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        res.cookie("jwt", token, {
            httpOnly: false,
            secure: true,
            sameSite: 'None',           // Explicitly allow cross-site
            maxAge: 2 * 60 * 60 * 1000,
        });

        // Remove password from user data before sending
        const { password: _, ...userWithoutPassword } = User.get({ plain: true });

        res.status(200).json({ 
            message: "Login successful", 
            user: userWithoutPassword,
            role: User.role,
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logoutUser = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
};

const modifyPassword = async (req, res) => {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
        return res.status(400).json({ message: "Email or phone and password are required" });
    }

    try {
        const User = await user.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
        if (!User) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update({ password: hashedPassword });
        res.status(200).json({ message: "Password modified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const editUser = async (req, res) => {
  // Try to get id from params, body, or query (adjust as needed)
  const id = req.params.id
  const { full_name, email, phone, bio, role, profession, password, sendWelcomeEmail, pictures } = req.body;
  
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    // Check if any data is provided to update
    const hasUpdates = full_name || email || phone || bio || role || profession || password || pictures;
    if (!hasUpdates) {
      return res.status(400).json({ message: "No update data provided" });
    }

    // Prepare update data with only provided fields
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (role) updateData.role = role;
    if (profession) updateData.profession = profession;
    if (pictures) updateData.pictures = pictures;
    
    // Find user and check email uniqueness in parallel if needed
    const findUserPromise = user.findOne({ where: { id } });
    let emailCheckPromise = Promise.resolve(null);
    
    if (email) {
      emailCheckPromise = user.findOne({ where: { email, id: { [Op.ne]: id } } });
    }
    
    const [existingUser, emailExists] = await Promise.all([findUserPromise, emailCheckPromise]);
    
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if email exists for another user
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    if (email) updateData.email = email;
    
    // Handle password update separately with encryption
    let clearPassword = null;
    if (password) {
      clearPassword = password;
      // Use a lower salt rounds if performance is critical
      updateData.password = await bcrypt.hash(password, 8); 
    }
    
    // Update user data in database
    await existingUser.update(updateData);
    
    // Track what changed for email notification
    const isEmailChanged = email && email !== existingUser.email;
    const isPasswordChanged = password !== undefined;
    
    // Only send email if needed and credentials changed
    if (sendWelcomeEmail === true && (isEmailChanged || isPasswordChanged)) {
      const recipientEmail = email || existingUser.email;
      
      // Build email content - only create if we're going to send
      let emailContent = `
        <h1>Account Information Update</h1>
        <p>Hello ${full_name || existingUser.full_name},</p>
        <p>Your account information has been updated. Here are the changes:</p>
      `;
      
      if (isEmailChanged) emailContent += `<p><strong>New Email:</strong> ${email}</p>`;
      if (isPasswordChanged) emailContent += `<p><strong>New Password:</strong> ${clearPassword}</p><p>Please change your password after login for security.</p>`;
      emailContent += `<p>Best regards,<br>Support Team</p>`;
      
      // Send email in non-blocking way
      sendEmail(
        recipientEmail,
        "Your Account Information Update",
        emailContent
      ).catch(err => console.error("Failed to send email:", err.message));
    }
    
    // Return updated user data
    const { password: _, ...userWithoutPassword } = existingUser.get({ plain: true });
    
    return res.status(200).json({ 
      message: "User updated successfully", 
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// In-memory store for reset tokens (in production, use a database or Redis)
const resetTokens = new Map()

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 1. Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const userRecord = await user.findOne({ where: { email } })
    if (!userRecord) {
      return res.json({ success: false, message: "No account found with this email" })
    }

    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    resetTokens.set(email, { code: verificationCode, expiresAt })

    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Hello ${userRecord.full_name},</p>
      <p>Use this code to reset your password:</p>
      <h3>${verificationCode}</h3>
      <p>This code will expire in 30 minutes.</p>
    `

    await sendEmail(email, "Password Reset Verification Code", htmlContent)

    await createNotification({
      recipientId: userRecord.id,
      message: "A password reset was requested for your account.",
      type: "Info",
      method: "app_notification",
    })

    res.status(200).json({ success: true, email, message: "Verification code sent to your email" })
  } catch (error) {
    console.error("forgotPassword:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// 2. Verify Reset Code
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" })
    }

    const token = resetTokens.get(email)
    if (!token || new Date() > token.expiresAt) {
      resetTokens.delete(email)
      return res.status(400).json({ success: false, message: "Code expired or not found" })
    }

    if (token.code !== code) {
      return res.status(400).json({ success: false, message: "Invalid code" })
    }

    res.status(200).json({ success: true, message: "Code is valid" })
  } catch (error) {
    console.error("verifyResetCode:", error)
    res.status(500).json({ success: false, email, message: "Internal server error" })
  }
}

// 3. Resend Code
const resendResetCode = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const userRecord = await user.findOne({ where: { email } })
    if (!userRecord) {
      return res.status(404).json({ success: false, message: "No account found with this email" })
    }

    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    resetTokens.set(email, { code: verificationCode, expiresAt })

    const htmlContent = `
      <h2>New Password Reset Code</h2>
      <p>Hello ${userRecord.full_name},</p>
      <p>Here is your new reset code:</p>
      <h3>${verificationCode}</h3>
      <p>This code expires in 30 minutes.</p>
    `

    await sendEmail(email, "New Verification Code", htmlContent)

    res.status(200).json({ success: true, message: "New code sent to your email" })
  } catch (error) {
    console.error("resendResetCode:", error)
    res.status(500).json({ success: false,email, message: "Internal server error" })
  }
}

// 4. Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" })
    }

    const token = resetTokens.get(email)
    if (!token || new Date() > token.expiresAt) {
      resetTokens.delete(email)
      return res.status(400).json({ success: false, message: "Code expired or session invalid" })
    }

    const userRecord = await user.findOne({ where: { email } })
    if (!userRecord) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await userRecord.update({ password: hashedPassword })
    resetTokens.delete(email)

    await createNotification({
      recipientId: userRecord.id,
      message: "Your password was reset successfully.",
      type: "Info",
      method: "app_notification",
    })

    res.status(200).json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.error("resetPassword:", error)
    res.status(500).json({ success: false,email, message: "Internal server error" })
  }
}


module.exports = { 
    registerPage,
    registerUser,
    loginPage,
    loginUser,
    logoutUser,
    modifyPassword,
    editUser,
    forgotPassword,
    verifyResetCode,
    resendResetCode,
    resetPassword
};
