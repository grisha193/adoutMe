import nodemailer from 'nodemailer';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s()+-]{7,20}$/;

function clean(value) {
  return String(value || '').trim();
}

export function validateContact(payload) {
  const data = {
    name: clean(payload.name),
    phone: clean(payload.phone),
    email: clean(payload.email),
    comment: clean(payload.comment),
  };

  const errors = {};

  if (data.name.length < 2) {
    errors.name = 'Введите имя минимум из 2 символов.';
  }

  if (!phonePattern.test(data.phone)) {
    errors.phone = 'Введите корректный телефон.';
  }

  if (!emailPattern.test(data.email)) {
    errors.email = 'Введите корректный email.';
  }

  if (data.comment.length < 10) {
    errors.comment = 'Комментарий должен быть не короче 10 символов.';
  }

  return { data, errors };
}

export function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      (process.env.SITE_OWNER_EMAIL || process.env.SMTP_USER),
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildEmails(data) {
  const ownerEmail = process.env.SITE_OWNER_EMAIL || process.env.SMTP_USER;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const ownerText = [
    'Новая заявка с сайта-портфолио.',
    '',
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
    '',
    `Комментарий: ${data.comment}`,
  ].join('\n');

  const userText = [
    `${data.name}, спасибо за сообщение!`,
    '',
    'Я получил вашу заявку и свяжусь с вами в ближайшее время.',
    '',
    'Копия вашего сообщения:',
    data.comment,
  ].join('\n');

  return [
    {
      from,
      to: ownerEmail,
      replyTo: data.email,
      subject: `Новая заявка от ${data.name}`,
      text: ownerText,
    },
    {
      from,
      to: data.email,
      subject: 'Копия обращения с сайта-портфолио',
      text: userText,
    },
  ];
}

export async function sendContactEmails(data) {
  const transporter = createTransporter();
  await Promise.all(buildEmails(data).map((email) => transporter.sendMail(email)));
}
