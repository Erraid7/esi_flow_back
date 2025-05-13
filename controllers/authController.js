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
            const subject = "📧 Welcome to the Platform!";
            const htmlContent = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #4f46e5; font-size: 24px; margin-bottom: 4px;">Bienvenue sur notre plateforme, ${full_name} !</h2>
      <p style="color: #6b7280; font-size: 16px;">Votre compte a été créé avec succès.</p>
    </div>
  
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  
    <div style="font-size: 16px; color: #111827; line-height: 1.6;">
      <p>Voici vos informations de connexion :</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="font-size: 16px; font-weight: bold; padding: 8px; background: #f3f4f6;">📧 Adresse e-mail :</td>
          <td style="font-size: 16px; padding: 8px; background: #f9fafb;">${email}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 8px; background: #f3f4f6;">🔐 Mot de passe :</td>
          <td style="padding: 8px; background: #f9fafb;">${password}</td>
        </tr>
      </table>
  
      <p style="margin-top: 24px;">
        Merci de vous connecter dès que possible et de modifier votre mot de passe pour garantir la sécurité de votre compte.
      </p>
  
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://yourplatform.com/login" target="_blank" style="background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          🔑 Se connecter
        </a>
      </div>
    </div>
  
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px;">
      Ceci est un message automatique. Merci de ne pas y répondre.
    </p>
  </div>`;
  
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
