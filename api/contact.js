import { readJsonBody, sendJson } from './_lib/body.js';
import { hasSmtpConfig, sendContactEmails, validateContact } from './_lib/contact.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Метод не поддерживается.' });
  }

  try {
    const body = await readJsonBody(req);
    const { data, errors } = validateContact(body);

    if (Object.keys(errors).length) {
      return sendJson(res, 422, {
        message: 'Проверьте поля формы.',
        errors,
      });
    }

    if (!hasSmtpConfig()) {
      return sendJson(res, 202, {
        message: 'Форма обработана в demo-режиме. Для реальной отправки добавьте SMTP-переменные.',
        mode: 'preview',
      });
    }

    await sendContactEmails(data);

    return sendJson(res, 200, {
      message: 'Сообщение отправлено. Копия письма ушла на указанный email.',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return sendJson(res, 502, {
      message: 'Не удалось отправить письмо. Попробуйте позже или проверьте SMTP-настройки.',
    });
  }
}
