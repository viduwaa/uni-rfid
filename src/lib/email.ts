//lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginCredentials(
  email: string,
  name: string,
  tempPassword: string,
  role: 'lecturer' | 'student'
) {
  // Debug environment variables
  console.log('🔍 Environment check:', {
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
    emailFrom: process.env.EMAIL_FROM,
    nextAuthUrl: process.env.NEXTAUTH_URL
  });

  const loginUrl =
    role === 'lecturer'
      ? `${process.env.NEXTAUTH_URL}/lecturer`
      : `${process.env.NEXTAUTH_URL}/student`;

  try {
    console.log('📧 Attempting to send email to:', email);
    
    const result = await resend.emails.send({
      from: "UNI RFID System " +"<"+process.env.EMAIL_FROM!+">",
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

    console.log('✅ Resend API response:', result);
    console.log('✅ Email sent successfully to:', email);
    
    return result; // Return the result for further debugging
    
  } catch (error: any) {
    console.error('❌ Resend API error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      response: error?.response?.data
    });
    throw error;
  }
}