import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import FieldError from '../shared/FieldError/FieldError';
import { clearFieldError, hasErrors, validateCode, validateEmail } from '../../shared/validation';
import { useCooldown } from '../../shared/useCooldown';
import { errorMessage, safeReturnPath, verifyCode } from '../../shared/auth';
import styles from './Login.module.css';

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
          <h1 className={styles.title}>вход</h1>
          <p className={styles.caption}>
            {codeSent
              ? `Код отправлен на ${email.trim()}. Он действует 10 минут.`
              : 'Пришлём код для входа на почту — пароль не нужен.'}
          </p>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {!codeSent && (
              <label className={styles.label}>
                Почта
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError(setErrors, 'email');
                    setError('');
                  }}
                  className={styles.input}
                  aria-invalid={errors.email ? 'true' : undefined}
                  autoComplete="email"
                  placeholder="you@mail.ru"
                  disabled={loading}
                  autoFocus
                />
                <FieldError>{errors.email}</FieldError>
              </label>
            )}

            {codeSent && (
              <label className={styles.label}>
                Код из письма
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    clearFieldError(setErrors, 'code');
                    setError('');
                  }}
                  className={`${styles.input} ${styles.codeInput}`}
                  aria-invalid={errors.code ? 'true' : undefined}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  disabled={loading}
                  autoFocus
                />
                <FieldError>{errors.code}</FieldError>
              </label>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {codeSent
                ? loading
                  ? 'Проверяем…'
                  : 'Войти'
                : loading
                  ? 'Отправляем…'
                  : 'Получить код'}
            </button>

            {codeSent && (
              <div className={styles.secondary}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={requestCode}
                  disabled={loading || cooldown.active}
                >
                  {cooldown.active
                    ? `отправить ещё раз через ${cooldown.secondsLeft} с`
                    : 'отправить код ещё раз'}
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={changeEmail}
                  disabled={loading}
                >
                  другая почта
                </button>
              </div>
            )}
          </form>
          <p className={styles.footer}>
            нет аккаунта?{' '}
            <Link to="/register" className={styles.footerLink}>
              зарегистрироваться
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

export default Login;
