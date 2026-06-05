import { randomUUID } from 'node:crypto';

const tokenState = {
  value: '',
  expiresAt: 0,
};

function clean(value) {
  return String(value || '').trim();
}

function getAuthHeader() {
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

export function hasGigaChatAuth() {
  return Boolean(getAuthHeader());
}

async function getGigaChatToken() {
  if (process.env.GIGACHAT_IGNORE_TLS_ERRORS === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  if (tokenState.value && tokenState.expiresAt - 60_000 > Date.now()) {
    return tokenState.value;
  }

  const authUrl = process.env.GIGACHAT_AUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  const scope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: randomUUID(),
    },
    body: new URLSearchParams({ scope }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.access_token) {
    throw new Error(result.message || result.error || 'GigaChat authorization failed');
  }

  const rawExpiresAt = Number(result.expires_at);
  tokenState.value = result.access_token;
  tokenState.expiresAt = rawExpiresAt
    ? rawExpiresAt < 1_000_000_000_000
      ? rawExpiresAt * 1000
      : rawExpiresAt
    : Date.now() + 25 * 60 * 1000;

  return tokenState.value;
}

export async function generateGigaChatSummary({ stack, experience, focus }) {
  const accessToken = await getGigaChatToken();
  const baseUrl = (process.env.GIGACHAT_BASE_URL || 'https://gigachat.devices.sberbank.ru/api/v1').replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GIGACHAT_MODEL || 'GigaChat-2',
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
