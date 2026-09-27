import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@healer/db';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
});

const resend = new Resend(process.env.RESEND_API_KEY || 'fake_key');
const nodemailerTransport = nodemailer.createTransport({
  host: 'localhost',
  port: 1026,
  secure: false,
});

export async function sendSmartEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV === 'development') {
    await nodemailerTransport.sendMail({
      from: 'Healer Dev <dev@localhost>',
      to,
      subject,
      html,
    });
  } else {
    await resend.emails.send({
      from: 'Healer <noreply@healer.app>',
      to,
      subject,
      html,
    });
  }
}
