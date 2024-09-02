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

    const verificationUrl = `${process.env.BASE_URL}/api/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Email kích hoạt tài khoản',
      html: `<p>Xin chào ${username},</p>
             <p>Cảm ơn bạn đã đăng ký! Vui lòng bấm vào đường link bên dưới để kích hoạt tài khoản:</p>
             <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

export default sendVerificationEmail;
