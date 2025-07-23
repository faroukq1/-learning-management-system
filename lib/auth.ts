import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';
import { env } from './env';
import { emailOTP } from 'better-auth/plugins';
import { resend } from './resend';
import { admin } from 'better-auth/plugins';
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // implement sending mail to user
        const { data, error } = await resend.emails.send({
          from: 'FaroukLMS <onboarding@resend.dev>',
          to: [email],
          subject: 'FaroukLMS - Verify your email',
          html: `<p>Your OTP is <strong>${otp}</strong></p>`,
        });
      },
    }),
    admin(),
  ],
});
