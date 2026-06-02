import React, { useState } from 'react';
import { stack } from '../data/portfolio.js';

function AiSummary() {
  const [summary, setSummary] = useState('');
  const [mode, setMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    setMode('');

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack,
          experience: '1 год',
          focus: 'fullstack-разработка',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'AI helper временно недоступен.');
      }

      setSummary(data.summary);
      setMode(data.mode || '');
    } catch (error) {
      setSummary(error.message || 'Не получилось сгенерировать summary.');
      setMode('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section ai-section" aria-labelledby="ai-title">
      <div>
        <p className="eyebrow">AI-интеграция</p>
        <h2 id="ai-title">GigaChat helper для короткого summary</h2>
        <p>
          Этот блок обращается к backend endpoint. Если задан GIGACHAT_API_KEY, сервер получает
          OAuth-токен GigaChat и делает запрос к модели. Без ключа возвращается локальный fallback,
          чтобы демо не ломалось.
        </p>
      </div>
      <div className="ai-box">
        <button className="button button--primary" type="button" onClick={generateSummary} disabled={isLoading}>
          {isLoading ? 'Генерирую...' : 'Сгенерировать summary'}
        </button>
        {mode === 'fallback' && (
          <small className="helper-note">Сейчас работает fallback: сервер не видит GIGACHAT_API_KEY.</small>
        )}
        {mode === 'gigachat' && <small className="helper-note helper-note--success">Ответ получен через GigaChat API.</small>}
        {summary && <p>{summary}</p>}
      </div>
    </section>
  );
}

export default AiSummary;
