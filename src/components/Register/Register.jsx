import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import AuthLayout from '../shared/AuthLayout/AuthLayout';
import CodeInput, { CODE_LENGTH } from '../shared/CodeInput/CodeInput';
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
import ui from '../../shared/ui.module.css';
import form from '../shared/AuthLayout/authForm.module.css';

const ROLE_OPTIONS = [
  {
    value: 'CREATOR',
    label: 'Я креатор',
    hint: 'Снимаю ролики и зарабатываю на просмотрах.',
  },
  {
    value: 'CUSTOMER',
    label: 'Я рекламодатель',
    hint: 'Запускаю кампании и плачу за подтверждённые просмотры.',
  },
];

const STEPS = [
  { title: 'Кто вы в Offer?', caption: 'Выберите роль. Её увидит вторая сторона сделки.' },
  { title: 'Как вас зовут?', caption: 'Имя увидит вторая сторона сделки.' },
  { title: 'Вход в кабинет', caption: 'Почта станет логином. Пароль не нужен.' },
  { title: 'Код из письма', caption: '' },
];

const STEP_ROLE = 0;
const STEP_NAME = 1;
const STEP_EMAIL = 2;
const STEP_CODE = 3;

const pad = (n) => String(n).padStart(2, '0');

const saveTelegram = (role, telegram) => {
  const body = { telegram };
  return role === 'CUSTOMER'
    ? apiClient.api.updateCustomerProfile(body)
    : apiClient.api.updateCreatorProfile(body);
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRole = ROLE_OPTIONS.some((option) => option.value === searchParams.get('role'))
    ? searchParams.get('role')
    : '';
  const [step, setStep] = useState(presetRole ? STEP_NAME : STEP_ROLE);
  const [formState, setFormState] = useState({
    role: presetRole,
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
    setFormState((prev) => ({ ...prev, [name]: value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const setCode = (code) => {
    setFormState((prev) => ({ ...prev, code }));
    clearFieldError(setErrors, 'code');
    setError('');
  };

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const selectRole = (role) => {
    setFormState((prev) => ({ ...prev, role }));
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
        name: validateRequired(formState.name, 'Укажите имя'),
        telegram: validateTelegram(formState.telegram),
      };
      setErrors(nextErrors);
      if (hasErrors(nextErrors)) return;
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const register = async () => {
    const email = formState.email.trim();
    const nextErrors = { email: validateEmail(email) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await apiClient.api.register({
        email,
        name: formState.name.trim(),
        role: formState.role,
      });
      setFormState((prev) => ({ ...prev, code: '' }));
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
    const nextErrors = { code: validateCode(formState.code) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await verifyCode(formState.email.trim(), formState.code.trim());
      const telegram = formState.telegram.trim();
      if (telegram) {
        try {
          await saveTelegram(formState.role, telegram);
        } catch {
          toast.error('Аккаунт создан, но Telegram не сохранился. Добавьте его в профиле.');
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
  const caption =
    step === STEP_CODE ? `Отправили код на ${formState.email.trim()}. Он действует 10 минут.` : current.caption;
  const submitLabel = (() => {
    if (step === STEP_CODE) return loading ? 'Проверяем…' : 'Продолжить';
    if (step === STEP_EMAIL) return loading ? 'Отправляем код…' : 'Получить код';
    return 'Дальше';
  })();
  const submitDisabled =
    loading || (step === STEP_CODE && formState.code.length < CODE_LENGTH);

  return (
    <AuthLayout
      title={current.title}
      caption={caption}
      footer={
        <p className={form.switch}>
          <span>Уже есть аккаунт?</span>
          <Link to="/login" className={form.switchLink}>
            Войти →
          </Link>
        </p>
      }
    >
      <div className={form.progress} aria-label={`Шаг ${step + 1} из ${STEPS.length}`}>
        {STEPS.map((item, index) => (
          <span
            key={item.title}
            className={`${form.progressBar} ${index <= step ? form.progressBarDone : ''}`}
          />
        ))}
      </div>
      <p className={form.stepLabel}>
        Шаг {step + 1} из {STEPS.length}
      </p>

      <form onSubmit={handleSubmit} className={form.form} noValidate>
        {step === STEP_ROLE && (
          <div className={form.roles} role="group" aria-label="Роль в сервисе">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${form.role} ${formState.role === option.value ? form.roleActive : ''}`}
                onClick={() => selectRole(option.value)}
                aria-pressed={formState.role === option.value}
              >
                <span className={form.roleLabel}>{option.label}</span>
                <span className={form.roleHint}>{option.hint}</span>
              </button>
            ))}
          </div>
        )}

        {step === STEP_NAME && (
          <>
            <label className={form.field}>
              <span className={form.label}>Имя</span>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={setField}
                className={form.input}
                aria-invalid={invalid('name')}
                autoComplete="name"
                autoFocus
              />
              <FieldError>{errors.name}</FieldError>
            </label>
            <label className={form.field}>
              <span className={form.label}>
                Telegram для связи
                <span className={form.optional}>можно пропустить</span>
              </span>
              <input
                type="text"
                name="telegram"
                value={formState.telegram}
                onChange={setField}
                className={form.input}
                aria-invalid={invalid('telegram')}
                placeholder="@username"
              />
              <FieldError>{errors.telegram}</FieldError>
            </label>
          </>
        )}

        {step === STEP_EMAIL && (
          <label className={form.field}>
            <span className={form.label}>Почта</span>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={setField}
              className={form.input}
              aria-invalid={invalid('email')}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              autoFocus
            />
            {errors.email ? (
              <FieldError>{errors.email}</FieldError>
            ) : (
              <span className={form.hint}>На неё придёт код для входа.</span>
            )}
          </label>
        )}

        {step === STEP_CODE && (
          <div className={form.field}>
            <span className={form.label}>Код из письма</span>
            <CodeInput
              value={formState.code}
              onChange={setCode}
              disabled={loading}
              invalid={Boolean(errors.code)}
              autoFocus
            />
            <FieldError>{errors.code}</FieldError>
            <button
              type="button"
              className={form.resend}
              onClick={register}
              disabled={loading || cooldown.active}
            >
              {cooldown.active
                ? `Отправить код ещё раз через 00:${pad(cooldown.secondsLeft)}`
                : 'Отправить код ещё раз'}
            </button>
          </div>
        )}

        {error && <p className={form.error}>{error}</p>}

        {step > STEP_ROLE && (
          <div className={form.actions}>
            <button
              type="submit"
              className={`${ui.btnPrimary} ${ui.btnLarge} ${ui.btnBlock}`}
              disabled={submitDisabled}
            >
              {submitLabel}
            </button>
            <button
              type="button"
              className={`${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock}`}
              onClick={goBack}
              disabled={loading}
            >
              Назад
            </button>
          </div>
        )}

        {step === STEP_CODE && (
          <div className={form.hintCard}>
            <p className={form.hintCardTitle}>Без пароля</p>
            <p className={form.hintCardText}>
              Каждый вход подтверждается одноразовым кодом из письма.
            </p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default Register;
