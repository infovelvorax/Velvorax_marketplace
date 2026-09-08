import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and caches the reusable Nodemailer transporter
 */
let transporter = null;

export const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: user.trim(),
        pass: pass.trim()
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Development fallback transporter if credentials are missing
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return transporter;
};

/**
 * Verify SMTP connection safely during development / startup
 */
export const verifyEmailTransport = async () => {
  try {
    const activeTransporter = getTransporter();
    if (activeTransporter.options?.jsonTransport) {
      console.log('[Email Service] Running in fallback JSON mode (SMTP credentials not fully set).');
      return false;
    }
    await activeTransporter.verify();
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    console.log(`[Email Service] SMTP connection established successfully with ${host}`);
    return true;
  } catch (error) {
    console.error('[Email Service] SMTP connection verification failed:', error.message);
    return false;
  }
};

/**
 * Send Password Reset OTP Email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - 6-digit verification code
 * @param {string} [options.name] - Optional user name
 */
export const sendPasswordResetOtpEmail = async ({ to, otp, name }) => {
  const defaultFrom = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@velvorax.com';
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Velvorax Marketplace" <${defaultFrom}>`;
  const greeting = name ? `Hello ${name},` : 'Hello,';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request - Velvorax Marketplace</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4F5F7;
      margin: 0;
      padding: 24px;
      color: #18181B;
    }
    .email-container {
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: #0E0A1A;
      padding: 32px 24px;
      text-align: center;
    }
    .brand-title {
      color: #F5F7FF;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }
    .brand-subtitle {
      color: #8B8CFF;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
    }
    .heading {
      font-size: 20px;
      font-weight: 800;
      color: #18181B;
      margin: 0 0 12px 0;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #6B7280;
      margin: 0 0 24px 0;
    }
    .otp-box {
      background: #F4F5F7;
      border: 2px dashed #4F46E5;
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6B7280;
      margin-bottom: 8px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #4F46E5;
      font-family: Consolas, 'Courier New', monospace;
      margin: 0;
    }
    .expiry-badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #D97706;
    }
    .security-notice {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 16px;
      font-size: 13px;
      color: #6B7280;
      line-height: 1.5;
      border: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }
    .footer {
      background: #FAFAFA;
      border-top: 1px solid #E5E7EB;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="brand-title">VELVORAX</h1>
      <div class="brand-subtitle">MARKETPLACE</div>
    </div>
    
    <div class="content">
      <h2 class="heading">Password Reset Request</h2>
      <p class="text">${greeting}</p>
      <p class="text">
        We received a request to reset your Velvorax account password. Use the verification code below to complete the reset process:
      </p>

      <div class="otp-box">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry-badge">⏱️ Expires in 10 minutes</div>
      </div>

      <div class="security-notice">
        <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized activity. Never share this verification code with anyone.
      </div>

      <p class="text" style="font-size: 14px; margin-bottom: 0;">
        Regards,<br>
        <strong>The Velvorax Security Team</strong>
      </p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} Velvorax Marketplace. All rights reserved.<br>
      This is an automated system email, please do not reply directly.
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Velvorax Marketplace - Password Reset Request

${greeting}

We received a request to reset your Velvorax account password.

Your verification code is: ${otp}

This code expires in 10 minutes.

Security Notice:
If you did not request this password reset, please ignore this email.
Never share this verification code with anyone.

Regards,
The Velvorax Security Team
https://velvorax.com
  `;

  try {
    const activeTransporter = getTransporter();
    const mailOptions = {
      from,
      to,
      subject: 'Velvorax Password Reset OTP',
      text: textContent,
      html: htmlContent
    };

    const info = await activeTransporter.sendMail(mailOptions);
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error(`Failed to send password reset email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Dedicated Admin 2FA Security Code Email
 * @param {Object} options
 * @param {string} options.to - Recipient email address (default rarajuvagga@velvorax.tech)
 * @param {string} options.otp - 6-digit verification code
 */
export const sendAdmin2FAEmail = async ({ to = 'rarajuvagga@velvorax.tech', otp }) => {
  const defaultFrom = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@velvorax.com';
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Velvorax Security" <${defaultFrom}>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Velvorax Admin Two-Factor Authentication</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E0A1A; margin: 0; padding: 24px; color: #F4F5F7; }
    .container { max-width: 520px; margin: 0 auto; background: #161226; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1E1738 0%, #0E0A1A 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.2); }
    .brand { color: #FFFFFF; font-size: 24px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
    .badge { color: #818CF8; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; }
    .content { padding: 36px 30px; text-align: center; }
    .title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 8px; }
    .desc { font-size: 14px; color: #9CA3AF; line-height: 1.6; margin-bottom: 28px; }
    .otp-box { background: rgba(99, 102, 241, 0.1); border: 2px dashed #6366F1; border-radius: 16px; padding: 20px; margin: 20px 0; }
    .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #818CF8; font-family: Consolas, monospace; margin: 0; }
    .timer { font-size: 12px; color: #F59E0B; font-weight: 700; margin-top: 8px; }
    .notice { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; font-size: 12px; color: #9CA3AF; text-align: left; margin-top: 24px; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">VELVORAX</h1>
      <div class="badge">🛡️ PLATFORM ADMINISTRATIVE SECURITY</div>
    </div>
    <div class="content">
      <div class="title">Two-Factor Authentication (2FA) Code</div>
      <div class="desc">A sign-in request to the Velvorax Master Admin Terminal was initiated. Use the authorization code below to complete sign-in:</div>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="timer">⏱️ Code expires in 10 minutes</div>
      </div>

      <div class="notice">
        <strong>Security Notice:</strong> If you did not initiate this administrator login, please secure your credentials immediately. Never share your 2FA security code with anyone.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Velvorax Marketplace Security System. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Velvorax Marketplace - Administrator 2FA Authorization

Your 2FA Security Code is: ${otp}

This code expires in 10 minutes.
Sent to: ${to}

If you did not request this code, please secure your admin account immediately.

Regards,
Velvorax Security Team
  `;

  try {
    const activeTransporter = getTransporter();
    const mailOptions = {
      from,
      to,
      subject: `Velvorax Admin 2FA Security Code: ${otp}`,
      text: textContent,
      html: htmlContent
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[Email Service] Admin 2FA Code sent to ${to}: ${otp} (MessageId: ${info?.messageId || 'sent'})`);
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error(`[Email Service] Failed to send admin 2FA email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  getTransporter,
  verifyEmailTransport,
  sendPasswordResetOtpEmail,
  sendAdmin2FAEmail
};
