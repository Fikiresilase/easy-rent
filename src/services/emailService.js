const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  registrationOTP: (otp) => ({
    subject: 'Registration OTP',
    text: `Your OTP for registration is: ${otp}\nThis OTP is valid for 10 minutes.`,
    html: `
      <h2>Registration Verification</h2>
      <p>Your OTP for registration is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  }),

  passwordResetOTP: (otp) => ({
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.`,
    html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  }),

  newMessage: (senderName, messagePreview) => ({
    subject: 'You Have a New Message on Easy Rent',
    text: `Hi, you have received a new message from ${senderName}: ${messagePreview}`,
    html: `
      <h2>New Message Received</h2>
      <p>You have a new message from <strong>${senderName}</strong>:</p>
      <blockquote style="color:#444;border-left:3px solid #ccc;padding-left:10px;">
        ${messagePreview}
      </blockquote>
      <p><a href="${process.env.FRONTEND_URL}/chat">Click here to reply</a></p>
      <p style="font-size:small;color:#999;">This is an automated message from Easy Rent.</p>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const mailOptions = {
      from: `"Easy Rent" <${process.env.SMTP_USER}>`,
      to,
      ...template(data),
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  emailTemplates,
  sendEmail,
}; 