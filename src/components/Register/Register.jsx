import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import FieldError from '../shared/FieldError/FieldError';
import {
  clearFieldError,
  hasErrors,
  validateCode,
  validateEmail,
  validateRequired,
  validateTelegram,
} from '../../shared/validation';
import { useCooldown } from '../../shared/useCooldown';
import { errorMessage, verifyCode } from '../../shared/auth';
import styles from './Register.module.css';

const ROLE_OPTIONS = [
  {
    value: 'CREATOR',
    label: 'я криатор',
    hint: 'снимаю ролики и зарабатываю на просмотрах',
  },
  {
    value: 'CUSTOMER',
    label: 'я заказчик',
    hint: 'публикую объявления и плачу за просмотры',
  },
];

const STEPS = [
  { title: 'кто вы', caption: 'выберите роль в сервисе' },
  { title: 'как вас зовут', caption: 'имя увидит вторая сторона сделки' },
  { title: 'вход в кабинет', caption: 'почта станет логином, пароль не нужен' },
  { title: 'код из письма', caption: 'подтвердите почту кодом, он действует 10 минут' },
];

const STEP_ROLE = 0;
const STEP_NAME = 1;
const STEP_EMAIL = 2;
const STEP_CODE = 3;

const saveTelegram = (role, telegram) => {
  const body = { telegram };
  return role === 'CUSTOMER'
    ? apiClient.api.updateCustomerProfile(body)
    : apiClient.api.updateCreatorProfile(body);
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: '',
    name: '',
    telegram: '',
    email: '',
    code: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown();

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'code' ? value.replace(/\D/g, '') : value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
    setError('');
    setStep(STEP_NAME);
  };

  const goBack = () => {
    setError('');
    setStep((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    if (step === STEP_NAME) {
      const nextErrors = {
        name: validateRequired(form.name, 'Укажите имя'),
        telegram: validateTelegram(form.telegram),
      };
      setErrors(nextErrors);
      if (hasErrors(nextErrors)) return;
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const register = async () => {
    const email = form.email.trim();
    const nextErrors = { email: validateEmail(email) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await apiClient.api.register({
        email,
        name: form.name.trim(),
        role: form.role,
      });
      setForm((prev) => ({ ...prev, code: '' }));
      cooldown.start();
      setStep(STEP_CODE);
    } catch (err) {
      const message = errorMessage(err, 'Не удалось зарегистрироваться');
      if (err?.response?.status === 409) {
        setErrors({ email: message });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const nextErrors = { code: validateCode(form.code) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await verifyCode(form.email.trim(), form.code.trim());

      const telegram = form.telegram.trim();
      if (telegram) {
        try {
          await saveTelegram(form.role, telegram);
        } catch {
          toast.error('Аккаунт создан, но Telegram не сохранился — добавьте его в профиле.');
        }
      }
      navigate('/app', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Не удалось подтвердить почту. Проверьте код.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === STEP_CODE) {
      verify();
    } else if (step === STEP_EMAIL) {
      register();
    } else {
      goNext();
    }
  };

  const current = STEPS[step];
  const submitLabel = (() => {
    if (step === STEP_CODE) return loading ? 'Проверяем…' : 'Войти';
    if (step === STEP_EMAIL) return loading ? 'Отправляем код…' : 'Получить код';
    return 'Дальше';
  })();

  return (
    <div className={styles.page}>
      <div className={styles.headerSafeArea} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logoLink} aria-label="На доску объявлений">
            <Logo light withText />
          </Link>
        </div>
      </header>

      <main className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.progress} aria-label={`Шаг ${step + 1} из ${STEPS.length}`}>
            {STEPS.map((item, index) => (
              <span
                key={item.title}
                className={`${styles.progressBar} ${index <= step ? styles.progressBarDone : ''}`}
              />
            ))}
          </div>
          <p className={styles.stepLabel}>
            шаг {step + 1} из {STEPS.length}
          </p>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.caption}>{current.caption}</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {step === STEP_ROLE && (
              <div className={styles.roleList} role="group" aria-label="Роль в сервисе">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      form.role === option.value
                        ? `${styles.roleCard} ${styles.roleCardActive}`
                        : styles.roleCard
                    }
                    onClick={() => selectRole(option.value)}
                    aria-pressed={form.role === option.value}
                  >
                    <span className={styles.roleLabel}>{option.label}</span>
                    <span className={styles.roleHint}>{option.hint}</span>
                  </button>
                ))}
              </div>
            )}

            {step === STEP_NAME && (
              <>
                <label className={styles.label}>
                  Имя
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('name')}
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
                    autoFocus
                  />
                  <FieldError>{errors.name}</FieldError>
                </label>
                <label className={styles.label}>
                  <span className={styles.labelRow}>
                    <SocialIcon name="telegram" className={styles.labelIcon} />
                    Telegram для связи
                    <span className={styles.optional}>можно пропустить</span>
                  </span>
                  <input
                    type="text"
                    name="telegram"
                    value={form.telegram}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('telegram')}
                    placeholder="@username"
                  />
                  <FieldError>{errors.telegram}</FieldError>
                </label>
              </>
            )}

            {step === STEP_EMAIL && (
              <label className={styles.label}>
                Почта (она же логин)
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={setField}
                  className={styles.input}
                  aria-invalid={invalid('email')}
                  autoComplete="email"
                  placeholder="you@mail.ru"
                  disabled={loading}
                  autoFocus
                />
                {errors.email ? (
                  <FieldError>{errors.email}</FieldError>
                ) : (
                  <span className={styles.hint}>на неё придёт код для входа</span>
                )}
              </label>
            )}

            {step === STEP_CODE && (
              <label className={styles.label}>
                Код из письма на {form.email.trim()}
                <input
                  type="text"
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={form.code}
                  onChange={setField}
                  className={`${styles.input} ${styles.codeInput}`}
                  aria-invalid={invalid('code')}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  disabled={loading}
                  autoFocus
                />
                <FieldError>{errors.code}</FieldError>
                <span className={styles.secondary}>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={register}
                    disabled={loading || cooldown.active}
                  >
                    {cooldown.active
                      ? `отправить ещё раз через ${cooldown.secondsLeft} с`
                      : 'отправить код ещё раз'}
                  </button>
                </span>
              </label>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {step > STEP_ROLE && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={goBack}
                  disabled={loading}
                >
                  назад
                </button>
                <button type="submit" className={styles.submit} disabled={loading}>
                  {submitLabel}
                </button>
              </div>
            )}
          </form>

          <p className={styles.footer}>
            уже есть аккаунт?{' '}
            <Link to="/login" className={styles.footerLink}>
              войти
            </Link>
          </p>
          <p className={styles.footer}>
            <Link to="/" className={styles.footerLink}>
              вернуться на доску объявлений
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
