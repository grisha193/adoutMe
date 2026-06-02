import React from 'react';
import { workSteps } from '../data/portfolio.js';

function WorkSection() {
  return (
    <section className="section section--split" id="work" aria-labelledby="work-title">
      <div className="section__intro">
        <p className="eyebrow">Как я работаю</p>
        <h2 id="work-title">От задачи к проверенному результату</h2>
        <p>
          Сначала уточняю цель и ограничения, затем разбиваю работу на понятные шаги: структура,
          интерфейс, API, обработка состояний, проверка крайних случаев.
        </p>
      </div>

      <div className="steps">
        {workSteps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WorkSection;
