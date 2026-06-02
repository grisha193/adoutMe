import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const ownerEmail = process.env.SITE_OWNER_EMAIL || process.env.SMTP_USER;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const isProduction = process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

const gigaChatAuthUrl = process.env.GIGACHAT_AUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const gigaChatBaseUrl = (process.env.GIGACHAT_BASE_URL || 'https://gigachat.devices.sberbank.ru/api/v1').replace(/\/$/, '');
const gigaChatScope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';
const gigaChatModel = process.env.GIGACHAT_MODEL || 'GigaChat-2';
let gigaChatToken = {
  value: '',
  expiresAt: 0,
};

app.use(cors());
app.use(express.json({ limit: '20kb' }));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s()+-]{7,20}$/;

function clean(value) {
  return String(value || '').trim();
}

function validateContact(payload) {
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

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && ownerEmail);
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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `Новая заявка от ${data.name}`;
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
      subject,
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

function getGigaChatAuthHeader() {
  const key = clean(process.env.GIGACHAT_API_KEY);
  const clientId = clean(process.env.GIGACHAT_CLIENT_ID);
  const clientSecret = clean(process.env.GIGACHAT_CLIENT_SECRET);

  if (clientId && clientSecret) {
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }

  if (key) {
    return key.toLowerCase().startsWith('basic ') ? key : `Basic ${key}`;
  }

  return '';
}

async function getGigaChatToken() {
  if (gigaChatToken.value && gigaChatToken.expiresAt - 60_000 > Date.now()) {
    return gigaChatToken.value;
  }

  const response = await fetch(gigaChatAuthUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: getGigaChatAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: randomUUID(),
    },
    body: new URLSearchParams({ scope: gigaChatScope }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.access_token) {
    throw new Error(result.message || result.error || 'GigaChat authorization failed');
  }

  const rawExpiresAt = Number(result.expires_at);
  const expiresAt = rawExpiresAt
    ? rawExpiresAt < 1_000_000_000_000
      ? rawExpiresAt * 1000
      : rawExpiresAt
    : Date.now() + 25 * 60 * 1000;

  gigaChatToken = {
    value: result.access_token,
    expiresAt,
  };

  return gigaChatToken.value;
}

async function generateGigaChatSummary({ stack, experience, focus }) {
  const accessToken = await getGigaChatToken();

  const response = await fetch(`${gigaChatBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: gigaChatModel,
      messages: [
        {
          role: 'system',
          content: 'Ты помогаешь разработчику оформить портфолио. Пиши кратко, честно и без преувеличений.',
        },
        {
          role: 'user',
          content: `Напиши короткое summary на русском для разработчика. Стек: ${stack}. Опыт: ${experience}. Направление: ${focus}. Одно предложение.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 120,
      stream: false,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || result.error?.message || 'GigaChat API error');
  }

  return result.choices?.[0]?.message?.content;
}

app.post('/api/contact', async (req, res) => {
  const { data, errors } = validateContact(req.body || {});

  if (Object.keys(errors).length) {
    return res.status(422).json({
      message: 'Проверьте поля формы.',
      errors,
    });
  }

  if (!hasSmtpConfig()) {
    console.info('Contact form preview:', data);
    return res.status(202).json({
      message: 'Форма обработана в demo-режиме. Для реальной отправки добавьте SMTP-переменные в .env.',
      mode: 'preview',
    });
  }

  try {
    const transporter = createTransporter();
    await Promise.all(buildEmails(data).map((email) => transporter.sendMail(email)));

    return res.json({
      message: 'Сообщение отправлено. Копия письма ушла на указанный email.',
    });
  } catch (error) {
    console.error('SMTP error:', error);
    return res.status(502).json({
      message: 'Не удалось отправить письмо. Попробуйте позже или проверьте SMTP-настройки.',
    });
  }
});

app.post('/api/ai-summary', async (req, res) => {
  const stack = Array.isArray(req.body?.stack) ? req.body.stack.slice(0, 12).join(', ') : 'React, Node.js, PHP';
  const experience = clean(req.body?.experience) || '1 год';
  const focus = clean(req.body?.focus) || 'fullstack-разработка';

  if (!getGigaChatAuthHeader()) {
    return res.json({
      mode: 'fallback',
      summary: `Fullstack-разработчик с опытом ${experience}: работаю со стеком ${stack}, собираю интерфейсы, API и формы с понятной обработкой состояний.`,
    });
  }

  try {
    const summary = await generateGigaChatSummary({ stack, experience, focus });

    return res.json({
      mode: 'gigachat',
      summary: summary || 'AI summary сгенерирован, но ответ пришел в неожиданном формате.',
    });
  } catch (error) {
    console.error('AI summary error:', error);
    return res.status(502).json({
      message: 'GigaChat-ключ найден, но запрос к GigaChat не прошел. Проверьте Client Secret, scope и доступ к ngw.devices.sberbank.ru:9443.',
      details: error.cause?.code || error.message,
    });
  }
});

if (isProduction) {
  app.use(express.static(distDir));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
