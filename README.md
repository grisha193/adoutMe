# Developer Landing

Лендинг-презентация fullstack-разработчика с React frontend, формой обратной связи, serverless API и AI helper через GigaChat.

## Стек

- Frontend: React, JavaScript, HTML, SCSS
- API: Vercel Serverless Functions, Node.js
- Email: Nodemailer + SMTP
- AI: GigaChat API с fallback-режимом
- Сборка: Vite

## Локальный запуск

```bash
npm install
npm run build
npm start
```

Локально проект открывается на `http://localhost:3000`.

## Переменные окружения

Создайте `.env` локально или добавьте эти переменные в Vercel Project Settings → Environment Variables.

```env
SITE_OWNER_EMAIL=yourmail@yandex.ru

SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=yourmail@yandex.ru
SMTP_PASS=app-password-from-yandex
SMTP_FROM="Developer Landing <yourmail@yandex.ru>"

GIGACHAT_API_KEY=
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_MODEL=GigaChat-2
GIGACHAT_IGNORE_TLS_ERRORS=false
```

Для Яндекс Почты в `SMTP_PASS` нужен пароль приложения, а не обычный пароль от почты.

## Форма

Форма находится в `src/components/ContactForm.jsx`.

API для Vercel находится в `api/contact.js`.

Форма отправляет:

- письмо владельцу сайта
- копию письма пользователю

Есть клиентская и серверная валидация, а также loading, success и error состояния.

## AI-интеграция

Блок `GigaChat helper` вызывает `/api/ai-summary`.

API для Vercel находится в `api/ai-summary.js`.

Если GigaChat-ключи не заданы, endpoint возвращает fallback-текст, чтобы демо не ломалось. Если в GigaChat есть только `Client ID` и `Client Secret`, можно заполнить `GIGACHAT_CLIENT_ID` и `GIGACHAT_CLIENT_SECRET`.

## Деплой на Vercel

1. Залейте проект на GitHub.
2. Создайте новый проект на Vercel.
3. Выберите GitHub-репозиторий.
4. Framework Preset: `Vite`.
5. Build Command:

```bash
npm run build
```

6. Output Directory:

```text
dist
```

7. Добавьте Environment Variables из раздела выше.
8. Нажмите Deploy.

Файл `vercel.json` уже добавлен: он отдает frontend из `dist` и оставляет `/api/contact` и `/api/ai-summary` как serverless functions.

## Структура

```text
.
├── api/
│   ├── _lib/
│   ├── ai-summary.js
│   └── contact.js
├── server/
│   └── index.js
├── src/
│   ├── components/
│   ├── data/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Что делалось с помощью ИИ

- Сформирована структура проекта.
- Подготовлен текст лендинга под тестовое задание.
- Реализованы состояния формы и серверная валидация.
- Добавлен API для формы и AI helper.
- Проект адаптирован под деплой на Vercel.

## Что исправлялось вручную

- Проект переведен с TypeScript на JavaScript.
- React-код разбит на компоненты.
- Express API дополнен serverless functions для Vercel.
- Добавлены реальные проекты и README-инструкции.
