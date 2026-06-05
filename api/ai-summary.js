import { readJsonBody, sendJson } from './_lib/body.js';
import { generateGigaChatSummary, hasGigaChatAuth } from './_lib/gigachat.js';

function clean(value) {
  return String(value || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Метод не поддерживается.' });
  }

  const body = await readJsonBody(req);
  const stack = Array.isArray(body.stack) ? body.stack.slice(0, 12).join(', ') : 'React, Node.js, PHP';
  const experience = clean(body.experience) || '1 год';
  const focus = clean(body.focus) || 'fullstack-разработка';

  if (!hasGigaChatAuth()) {
    return sendJson(res, 200, {
      mode: 'fallback',
      summary: `Fullstack-разработчик с опытом ${experience}: работаю со стеком ${stack}, собираю интерфейсы, API и формы с понятной обработкой состояний.`,
    });
  }

  try {
    const summary = await generateGigaChatSummary({ stack, experience, focus });

    return sendJson(res, 200, {
      mode: 'gigachat',
      summary: summary || 'AI summary сгенерирован, но ответ пришел в неожиданном формате.',
    });
  } catch (error) {
    console.error('AI summary API error:', error);
    return sendJson(res, 502, {
      message: 'GigaChat-ключ найден, но запрос к GigaChat не прошел. Проверьте Client Secret, scope и доступ к GigaChat.',
      details: error.cause?.code || error.message,
    });
  }
}
