import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, userName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"KasiRent" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - KasiRent',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, hsl(32, 95%, 44%), hsl(17, 88%, 50%));
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, hsl(32, 95%, 44%), hsl(17, 88%, 50%));
              color: white;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 KasiRent</h1>
            <p>Password Reset Request</p>
          </div>
          
          <div class="content">
            <p>Hello${userName ? ' ' + userName : ''},</p>
            
            <p>We received a request to reset your password for your KasiRent account. Click the button below to create a new password:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated message from KasiRent. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} KasiRent. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello${userName ? ' ' + userName : ''},

We received a request to reset your password for your KasiRent account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} KasiRent. All rights reserved.
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email (optional - for future use)
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"KasiRent" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to KasiRent! 🏠',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, hsl(32, 95%, 44%), hsl(17, 88%, 50%));
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 Welcome to KasiRent!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Welcome to KasiRent! Your account has been successfully created.</p>
            <p>Start exploring properties and find your perfect home today!</p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Error sending welcome email:', error);
    throw error;
  }
};
