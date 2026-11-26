import React, { useCallback, useEffect, useRef, useState } from 'react';
import { applyAuth, rememberPendingTelegram, telegramAuthApi } from '../../../shared/telegramAuth';
import { errorMessage } from '../../../shared/auth';
import ui from '../../../shared/ui.module.css';
import styles from './TelegramLogin.module.css';
import { isMiniApp } from '../../../shared/miniApp';

const POLL_MS = 2000;

/**
 * Кнопка «Войти через Telegram». Ссылка в бота готовится заранее — это обычная ссылка,
 * браузер не блокирует её как всплывающее окно. После нажатия ждём подтверждения в боте.
 *
 * role — для страницы регистрации: новая учётка сразу получит эту роль.
 * onDone() — вход выполнен; onNeedEmail(telegram) — Telegram подтверждён, человек войдёт по почте.
 */
const TelegramLoginButton = ({ role, referralCode, label = 'Войти через Telegram', onDone, onNeedEmail }) => {
  const [attempt, setAttempt] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [generation, setGeneration] = useState(0);
  const handlers = useRef({ onDone, onNeedEmail });
  handlers.current = { onDone, onNeedEmail };

  // Новая попытка: при открытии, при смене роли и когда старая истекла
  useEffect(() => {
    let cancelled = false;
    let timer;
    setAttempt(null);
    setWaiting(false);
    telegramAuthApi
      .start({ role: role || undefined, referralCode: referralCode || undefined })
      .then((data) => {
        if (cancelled) return;
        setUnavailable(false);
        setAttempt(data);
        const left = new Date(data.expiresAt).getTime() - Date.now() - 30 * 1000;
        timer = setTimeout(() => setGeneration((n) => n + 1), Math.max(left, 30 * 1000));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 503) {
          setUnavailable(true);
        } else {
          setMessage(errorMessage(err, 'Не удалось подготовить вход через Telegram'));
          timer = setTimeout(() => setGeneration((n) => n + 1), 15 * 1000);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [role, referralCode, generation]);

  const check = useCallback(async () => {
    if (!attempt) return;
    try {
      const result = await telegramAuthApi.poll(attempt.secret);
      if (result.status === 'DONE') {
        setWaiting(false);
        applyAuth(result.auth);
        handlers.current.onDone?.(result);
      } else if (result.status === 'NEED_EMAIL') {
        setWaiting(false);
        rememberPendingTelegram(attempt.secret, result.telegram);
        setMessage(
          `Telegram ${result.telegram || ''} подтверждён. Войдите по почте — он привяжется к вашему аккаунту.`
        );
        handlers.current.onNeedEmail?.(result.telegram);
      } else if (result.status === 'CANCELLED') {
        setWaiting(false);
        setMessage('Вход отменён в Telegram.');
        setGeneration((n) => n + 1);
      } else if (result.status === 'EXPIRED') {
        setWaiting(false);
        setMessage('Ссылка устарела — нажмите кнопку ещё раз.');
        setGeneration((n) => n + 1);
      }
    } catch {
      // сеть моргнула — спросим ещё раз
    }
  }, [attempt]);

  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setInterval(check, POLL_MS);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
    };
  }, [waiting, check]);

  if (unavailable) return null;

  return (
    <div className={styles.box}>
      {attempt ? (
        <a
          className={`${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock} ${styles.button}`}
          href={attempt.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            setMessage('');
            setWaiting(true);
          }}
        >
          <TelegramIcon />
          {label}
        </a>
      ) : (
        <button type="button" className={`${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock} ${styles.button}`} disabled>
          <TelegramIcon />
          {label}
        </button>
      )}
      {waiting && <p className={styles.note}>Нажмите «Start» в боте и подтвердите вход — страница обновится сама.</p>}
      {message && <p className={styles.note}>{message}</p>}
    </div>
  );
};

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
    <path
      fill="currentColor"
      d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 13 1.5 11.5c-1-.3-1.1-1 .2-1.5L20.6 2.8c.9-.3 1.6.2 1.3 1.5Z"
    />
  </svg>
);

// Внутри мини-приложения Telegram уже вошли по initData — кнопка «в бота» там лишняя
const TelegramLogin = (props) => (isMiniApp() ? null : <TelegramLoginButton {...props} />);

export default TelegramLogin;
