import React, { useMemo, useState } from 'react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  comment: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s()+-]{7,20}$/;

function validateForm(values) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Введите имя минимум из 2 символов.';
  }

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = 'Введите корректный телефон.';
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Введите корректный email.';
  }

  if (values.comment.trim().length < 10) {
    errors.comment = 'Комментарий должен быть не короче 10 символов.';
  }

  return errors;
}

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const isSending = status.type === 'loading';

  const formIsReady = useMemo(() => {
    return form.name.trim() && form.phone.trim() && form.email.trim() && form.comment.trim();
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus({ type: 'error', message: 'Исправьте поля, подсвеченные ниже.' });
      return;
    }

    setErrors({});
    setStatus({ type: 'loading', message: 'Отправляю сообщение...' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(data.message || 'Не удалось отправить форму.');
      }

      setStatus({
        type: 'success',
        message: data.message || 'Сообщение отправлено. Копия письма ушла на указанный email.',
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Произошла ошибка. Проверьте данные и попробуйте еще раз.',
      });
    }
  };

  return (
    <form className="contact-form" onSubmit={submitForm} noValidate>
      <label>
        Имя
        <input
          className={errors.name ? 'field-invalid' : ''}
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Ваше имя"
          minLength="2"
          required
        />
        {errors.name && <small className="field-error">{errors.name}</small>}
      </label>
      <label>
        Телефон
        <input
          className={errors.phone ? 'field-invalid' : ''}
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+7 999 123-45-67"
          required
        />
        {errors.phone && <small className="field-error">{errors.phone}</small>}
      </label>
      <label>
        Email
        <input
          className={errors.email ? 'field-invalid' : ''}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="mail@example.com"
          required
        />
        {errors.email && <small className="field-error">{errors.email}</small>}
      </label>
      <label>
        Комментарий
        <textarea
          className={errors.comment ? 'field-invalid' : ''}
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Коротко опишите задачу"
          rows="5"
          minLength="10"
          required
        />
        {errors.comment && <small className="field-error">{errors.comment}</small>}
      </label>

      <button className="button button--primary" type="submit" disabled={isSending || !formIsReady}>
        {isSending ? 'Отправка...' : 'Отправить'}
      </button>

      {status.message && (
        <p className={`form-message form-message--${status.type}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}

export default ContactForm;
