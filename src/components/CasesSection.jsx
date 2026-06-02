import React from 'react';
import { projects } from '../data/portfolio.js';

function CasesSection() {
  return (
    <section className="section" id="cases" aria-labelledby="cases-title">
      <div className="section__intro">
        <p className="eyebrow">Кейсы / опыт</p>
        <h2 id="cases-title">Проекты, которые показывают подход</h2>
      </div>

      <div className="case-grid">
        {projects.map((project) => (
          <article className="case-card" key={project.title}>
            <p>{project.type}</p>
            <h3>{project.title}</h3>
            <span>{project.text}</span>
            <strong>{project.role}</strong>
            {project.url && (
              <a className="case-card__link" href={project.url} target="_blank" rel="noreferrer">
                Открыть проект
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default CasesSection;
