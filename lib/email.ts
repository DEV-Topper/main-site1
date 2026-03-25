import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail';

const resend = new Resend('re_jEASEnwa_LtU3ojZ3XQ4grz2oiBAz4iu2');

const FROM_EMAIL = 'De’socialPlug <onboarding@support.desocialplug.com>';

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to DeSocialPlug!',
      react: await WelcomeEmail({ username }),
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetLink: string,
) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - De’SocialPlug',
      react: await ResetPasswordEmail({ username, resetLink }),
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}
