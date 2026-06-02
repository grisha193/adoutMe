import React from 'react';
import { stack } from '../data/portfolio.js';

function AboutSection() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="section__intro">
        <p className="eyebrow">Информация о себе</p>
        <h2 id="about-title">Стек, опыт и направления</h2>
      </div>

      <div className="about-grid">
        <article className="panel panel--accent">
          <h3>1 год практического опыта</h3>
          <p>
            Развиваюсь как fullstack-разработчик: закрываю задачи от верстки и клиентской логики до
            простых API, форм, валидации и работы с базами данных.
          </p>
        </article>
        <article className="panel">
          <h3>Основные направления</h3>
          <p>
            Лендинги, SPA-интерфейсы, формы обратной связи, CRUD-страницы, интеграции с внешними
            сервисами и небольшие backend-модули.
          </p>
        </article>
      </div>

      <ul className="stack-list" aria-label="Технологический стек">
        {stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default AboutSection;
