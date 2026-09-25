import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import AuthLayout from '../shared/AuthLayout/AuthLayout';
import CodeInput, { CODE_LENGTH } from '../shared/CodeInput/CodeInput';
import FieldError from '../shared/FieldError/FieldError';
import { clearFieldError, hasErrors, validateCode, validateEmail } from '../../shared/validation';
import { useCooldown } from '../../shared/useCooldown';
import { errorMessage, safeReturnPath, verifyCode } from '../../shared/auth';
import ui from '../../shared/ui.module.css';
import form from '../shared/AuthLayout/authForm.module.css';

const pad = (n) => String(n).padStart(2, '0');

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown();

  const requestCode = async () => {
    const nextErrors = { email: validateEmail(email) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await apiClient.api.requestCode({ email: email.trim() });
      setCodeSent(true);
      setCode('');
      cooldown.start();
    } catch (err) {
      const message = errorMessage(err, 'Не удалось отправить код');
      if (err?.response?.status === 404) {
        setErrors({ email: message });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const nextErrors = { code: validateCode(code) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      await verifyCode(email.trim(), code.trim());
      navigate(safeReturnPath(searchParams.get('from')), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Не удалось войти. Проверьте код.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codeSent) {
      verify();
    } else {
      requestCode();
    }
  };

  const changeEmail = () => {
    setCodeSent(false);
    setCode('');
    setError('');
    setErrors({});
  };

  const handleCode = (next) => {
    setCode(next);
    clearFieldError(setErrors, 'code');
    setError('');
  };

  return (
    <AuthLayout
      title="Вход в Offer"
      caption={
        codeSent
          ? `Отправили код на ${email.trim()}. Он действует 10 минут.`
          : 'Пришлём код для входа на почту. Пароль не нужен.'
      }
      footer={
        <p className={form.switch}>
          <span>Впервые в Offer?</span>
          <Link to="/register" className={form.switchLink}>
            Создать аккаунт →
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className={form.form} noValidate>
        {!codeSent ? (
          <label className={form.field}>
            <span className={form.label}>Почта</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError(setErrors, 'email');
                setError('');
              }}
              className={form.input}
              aria-invalid={errors.email ? 'true' : undefined}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              autoFocus
            />
            <FieldError>{errors.email}</FieldError>
          </label>
        ) : (
          <div className={form.field}>
            <span className={form.label}>Код из письма</span>
            <CodeInput
              value={code}
              onChange={handleCode}
              disabled={loading}
              invalid={Boolean(errors.code)}
              autoFocus
            />
            <FieldError>{errors.code}</FieldError>
            <button
              type="button"
              className={form.resend}
              onClick={requestCode}
              disabled={loading || cooldown.active}
            >
              {cooldown.active
                ? `Отправить код ещё раз через 00:${pad(cooldown.secondsLeft)}`
                : 'Отправить код ещё раз'}
            </button>
          </div>
        )}

        {error && <p className={form.error}>{error}</p>}

        <div className={form.actions}>
          <button
            type="submit"
            className={`${ui.btnPrimary} ${ui.btnLarge} ${ui.btnBlock}`}
            disabled={loading || (codeSent && code.length < CODE_LENGTH)}
          >
            {codeSent
              ? loading
                ? 'Проверяем…'
                : 'Продолжить'
              : loading
                ? 'Отправляем…'
                : 'Получить код'}
          </button>
          {codeSent && (
            <>
              <span className={form.or}>или</span>
              <button
                type="button"
                className={`${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock}`}
                onClick={changeEmail}
                disabled={loading}
              >
                Изменить адрес почты
              </button>
            </>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
