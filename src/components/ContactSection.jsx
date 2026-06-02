import React from 'react';
import ContactForm from './ContactForm.jsx';

function ContactSection() {
  return (
    <section className="section contact-section" id="contacts" aria-labelledby="contacts-title">
      <div className="contact-copy">
        <p className="eyebrow">Контакты</p>
        <h2 id="contacts-title">Готов обсудить задачу</h2>
        <p>
          Оставьте контакты, и форма отправит письмо владельцу сайта, а пользователю придет копия
          обращения. На сервере есть повторная валидация и обработка ошибок SMTP.
        </p>
        <ul>
          <li>Email: developer@example.com</li>
          <li>Telegram: @developer</li>
          <li>GitHub: github.com/developer</li>
        </ul>
      </div>

      <ContactForm />
    </section>
  );
}

export default ContactSection;
