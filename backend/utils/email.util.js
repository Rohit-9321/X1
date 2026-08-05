const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to, subject, html,
  });
};

const emailTemplates = {
  verify: (name, url) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#5B3BF5">Verify your X1 account</h2>
      <p>Hi ${name},</p>
      <p>Click below to verify your email address:</p>
      <a href="${url}" style="display:inline-block;background:#5B3BF5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#888;margin-top:24px">Link expires in 24 hours.</p>
    </div>`,

  resetPassword: (name, url) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#5B3BF5">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>Click below to reset your password:</p>
      <a href="${url}" style="display:inline-block;background:#5B3BF5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#888;margin-top:24px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>`,

  welcome: (name) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#5B3BF5">Welcome to X1 Platform! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your account is ready. Start preparing for your dream company today.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#5B3BF5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a>
    </div>`,
};

module.exports = { sendEmail, emailTemplates };
