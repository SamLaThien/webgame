// @lib/mailer.js
import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, username, verificationToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Account Activation - Your App Name',
      html: `<p>Hello ${username},</p>
             <p>Thank you for signing up. Please click the link below to verify your email address:</p>
             <a href="${process.env.BASE_URL}/api/verify-email?token=${verificationToken}">Verify Email</a>
             <p>If you did not sign up, please ignore this email.</p>
             <p>Best regards,<br>Your App Name Team</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

export default sendVerificationEmail;
