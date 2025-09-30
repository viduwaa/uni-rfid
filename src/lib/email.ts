//lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginCredentials(
    email: string,
    name: string,
    tempPassword: string,
    role: "lecturer" | "student"
) {
    // Debug environment variables
    console.log("🔍 Environment check:", {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + "...",
        emailFrom: process.env.EMAIL_FROM,
        nextAuthUrl: process.env.NEXTAUTH_URL,
    });

    const loginUrl =
        role === "lecturer"
            ? `${process.env.NEXTAUTH_URL}/lecturer`
            : `${process.env.NEXTAUTH_URL}/student`;

    try {
        console.log("📧 Attempting to send email to:", email);

        const result = await resend.emails.send({
            from: "UNI RFID System " + "<" + process.env.EMAIL_FROM! + ">",
            to: email,
            subject: `Welcome to Our Platform - Your Login Credentials`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our Platform!</h2>
          <p>Dear ${name},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
          <p>
            <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Login to Your Dashboard
            </a>
          </p>
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Platform Team</p>
        </div>
      `,
        });

        console.log("✅ Resend API response:", result);
        console.log("✅ Email sent successfully to:", email);

        return result; // Return the result for further debugging
    } catch (error: any) {
        console.error("❌ Resend API error details:", {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
            response: error?.response?.data,
        });
        throw error;
    }
}

export async function sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/forgot-password/reset?token=${resetToken}`;

    try {
        console.log("📧 Attempting to send password reset email to:", email);

        const result = await resend.emails.send({
            from: "UNI RFID System " + "<" + process.env.EMAIL_FROM! + ">",
            to: email,
            subject: "Password Reset Request - UNI RFID System",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Dear ${name},</p>
          <p>We received a request to reset your password for your UNI RFID System account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Important:</strong></p>
            <ul style="margin: 10px 0; color: #856404;">
              <li>This link will expire in 24 hours</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>For security reasons, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you continue to have problems, please contact our support team.</p>
          <p>Best regards,<br>The UNI RFID System Team</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="font-size: 12px; color: #6c757d; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
        });

        console.log("✅ Password reset email sent successfully to:", email);
        return result;
    } catch (error: any) {
        console.error("❌ Error sending password reset email:", {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
            response: error?.response?.data,
        });
        throw error;
    }
}
