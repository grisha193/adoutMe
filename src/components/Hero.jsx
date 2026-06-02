import React from 'react';

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="eyebrow">Fullstack developer · 1 год опыта</p>
        <h1 id="hero-title">Разрабатываю аккуратные интерфейсы и понятные API</h1>
        <p className="hero__lead">
          Работаю с React, JavaScript, Node.js, PHP и базами данных. Люблю задачи, где нужно быстро
          разобраться в логике продукта, собрать чистый frontend и довести форму или интеграцию до
          рабочего состояния.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#contacts">
            Связаться
          </a>
          <a className="button button--ghost" href="#cases">
            Смотреть кейсы
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-label="Рабочая карточка разработчика">
        <div className="window-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <pre>
          <code>{`const developer = {
  stack: ['React', 'Node', 'PHP'],
  focus: 'fullstack',
  habit: 'ship, test, improve'
};`}</code>
        </pre>
        <div className="metrics">
          <span>API</span>
          <strong>Express</strong>
          <span>DB</span>
          <strong>SQL</strong>
        </div>
      </div>
    </section>
  );
}

export default Hero;
