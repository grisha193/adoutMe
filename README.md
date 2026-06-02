# Developer Landing

Небольшой лендинг-презентация fullstack-разработчика с React-фронтендом, API для формы обратной связи и простым AI helper.

## Стек

- Frontend: React, JavaScript, HTML, SCSS
- Backend/API: Node.js, Express
- Email: Nodemailer + SMTP
- AI-интеграция: GigaChat API с fallback-режимом без ключа
- Сборка: Vite

## Как запустить

```bash
npm install
npm run dev
```

Проект откроется на `http://localhost:3000`.

Для production-сборки:

```bash
npm run build
npm start
```

Команда `npm start` отдает собранную папку `dist` через Express.

## Переменные окружения

Создайте `.env` по примеру `.env.example`.

```env
PORT=3000
SITE_OWNER_EMAIL=owner@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mailbox@example.com
SMTP_PASS=strong-password
SMTP_FROM="Developer Landing <mailbox@example.com>"
GIGACHAT_API_KEY=
GIGACHAT_CLIENT_ID=
GIGACHAT_CLIENT_SECRET=
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_MODEL=GigaChat-2
```

## Как реализована форма

Форма находится в `src/components/ContactForm.jsx`, endpoint находится в `server/index.js`.

Поля формы:

- имя
- телефон
- email
- комментарий

На клиенте есть обязательные поля, disabled-состояние кнопки, `loading`, `success` и `error` сообщения. На сервере данные повторно очищаются и валидируются. Если SMTP настроен, сервер отправляет два письма: владельцу сайта и копию пользователю. Если SMTP не настроен, endpoint возвращает demo-ответ `202`, чтобы проект можно было проверить локально без почтового аккаунта.

## AI-интеграция

На странице есть блок `AI helper`. Он вызывает `/api/ai-summary`.

Если задан `GIGACHAT_API_KEY`, сервер получает OAuth-токен GigaChat, делает запрос к `/chat/completions` и генерирует короткое summary по стеку и опыту. Если ключа нет, возвращается локальный fallback-текст. Это позволяет показать сценарий интеграции и при этом не ломать демо.

В `GIGACHAT_API_KEY` нужно положить Authorization Key из кабинета GigaChat. Префикс `Basic` можно не добавлять: сервер добавит его сам. Если в кабинете есть только `Client ID` и `Client Secret`, можно заполнить `GIGACHAT_CLIENT_ID` и `GIGACHAT_CLIENT_SECRET`. Сервер в первую очередь использует пару `Client ID` + `Client Secret`, если она заполнена. Для личного аккаунта используется scope `GIGACHAT_API_PERS`.

## Частые проблемы

Если AI-блок пишет, что работает fallback, значит сервер не видит GigaChat-авторизацию. Проверьте, что в корне проекта есть файл `.env`, заполнен `GIGACHAT_API_KEY` или пара `GIGACHAT_CLIENT_ID` + `GIGACHAT_CLIENT_SECRET`, а сервер перезапущен после изменения `.env`.

Если форма возвращает ошибку `422`, значит не прошла валидация. Комментарий должен быть минимум 10 символов, email должен быть в формате `name@example.com`, телефон должен содержать 7-20 допустимых символов.

Если форма пишет demo-режим, значит не заполнены SMTP-переменные. В этом режиме API принимает и валидирует данные, но письма физически не отправляет.

## Что делалось с помощью ИИ

- Сформирована структура проекта.
- Подготовлен текст лендинга под тестовое задание.
- Реализованы состояния формы и серверная валидация.
- Добавлен минимальный AI endpoint с безопасным fallback.
- Подготовлен README с инструкциями запуска.

## Что пришлось исправлять вручную

- Проект переведен с TypeScript на обычный JavaScript по требованию.
- Упрощен Vite-конфиг: убран `@vitejs/plugin-react`, потому что локальная установка пакета пришла поврежденной после прерванного `npm install`.
- Проверена production-сборка через `npm run build`.

## Структура

```text
.
├── server/
│   └── index.js
├── src/
│   ├── components/
│   │   ├── AboutSection.jsx
│   │   ├── AiSummary.jsx
│   │   ├── CasesSection.jsx
│   │   ├── ContactForm.jsx
│   │   ├── ContactSection.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   └── WorkSection.jsx
│   ├── data/
│   │   └── portfolio.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles/
│       └── main.scss
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Деплой

Подойдет Render, Railway, Fly.io или VPS, где можно запустить Node.js сервер.

Команды для деплоя:

```bash
npm install
npm run build
npm start
```

Перед публикацией нужно добавить SMTP-переменные окружения. Без них форма работает в demo-режиме и письма физически не отправляет.
