import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const emailTemplates = {
  welcomeStudent: (name: string, matricNumber: string, schoolName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">NexFord Edu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Welcome, ${name}!</h2>
        <p>Your student account at <strong>${schoolName}</strong> has been approved.</p>
        <p>Your matriculation number is: <strong>${matricNumber}</strong></p>
        <p>You can now log in to access your courses, attendance records, and the AI study assistant.</p>
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background: #1a3c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Login to NexFord Edu
        </a>
      </div>
      <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} NexFord Edu. All rights reserved.</p>
      </div>
    </div>
  `,

  accountApproved: (name: string, role: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">NexFord Edu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Account Approved!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your <strong>${role}</strong> account has been approved. You can now log in to the platform.</p>
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background: #1a3c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Login Now
        </a>
      </div>
    </div>
  `,

  passwordReset: (name: string, resetUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">NexFord Edu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Password Reset Request</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" 
           style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `,

  resultPublished: (name: string, courseName: string, totalScore: number, grade: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a3c6e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">NexFord Edu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Result Published</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your result for <strong>${courseName}</strong> has been published.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background: #1a3c6e; color: white;">
            <th style="padding: 10px; text-align: left;">Course</th>
            <th style="padding: 10px; text-align: center;">Total Score</th>
            <th style="padding: 10px; text-align: center;">Grade</th>
          </tr>
          <tr style="background: white;">
            <td style="padding: 10px;">${courseName}</td>
            <td style="padding: 10px; text-align: center;">${totalScore}</td>
            <td style="padding: 10px; text-align: center; font-weight: bold;">${grade}</td>
          </tr>
        </table>
        <a href="${process.env.FRONTEND_URL}/student/results" 
           style="background: #1a3c6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
          View Full Results
        </a>
      </div>
    </div>
  `,
};
