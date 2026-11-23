import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSession } from '../../shared/session';
import { errorMessage } from '../../shared/auth';
import { applyAuth, telegramAuthApi } from '../../shared/telegramAuth';
import { validateEmail } from '../../shared/validation';
import ui from '../../shared/ui.module.css';
import styles from './LoginSettings.module.css';

/**
 * Способы входа. Учётка из Telegram живёт без почты — здесь к ней добавляют почту,
 * чтобы входить и по коду из письма. Почта, занятая другой учёткой, не подойдёт: дублей не бывает.
 */
const LoginSettings = () => {
  const { user, reload } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const send = async () => {
    const problem = validateEmail(email);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await telegramAuthApi.addEmail(email.trim());
      setSent(true);
      toast.success('Код отправлен на почту');
    } catch (err) {
      setError(errorMessage(err, 'Не удалось отправить код'));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const auth = await telegramAuthApi.addEmail(email.trim(), code.trim());
      applyAuth(auth);
      reload();
      toast.success('Почта добавлена — теперь можно входить и по ней');
    } catch (err) {
      setError(errorMessage(err, 'Не удалось подтвердить почту'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={ui.page}>
      <div className={`${ui.card} ${styles.card}`}>
        <h2 className={ui.cardTitle}>Вход в аккаунт</h2>
        {user.telegramOnly ? (
          <>
            <p className={ui.muted}>
              Сейчас вы входите только через Telegram. Добавьте почту — сможете входить и по коду из письма.
            </p>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                if (sent) confirm();
                else send();
              }}
              noValidate
            >
              <input
                type="email"
                className={ui.input}
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                disabled={busy || sent}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
              {sent && (
                <input
                  type="text"
                  inputMode="numeric"
                  className={ui.input}
                  placeholder="Код из письма"
                  autoComplete="one-time-code"
                  value={code}
                  disabled={busy}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  autoFocus
                />
              )}
              <div className={styles.actions}>
                <button type="submit" className={ui.btnPrimary} disabled={busy || (sent && code.length < 6)}>
                  {sent ? 'Подтвердить' : 'Получить код'}
                </button>
                {sent && (
                  <button
                    type="button"
                    className={ui.btnGhost}
                    disabled={busy}
                    onClick={() => {
                      setSent(false);
                      setCode('');
                    }}
                  >
                    Другая почта
                  </button>
                )}
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </>
        ) : (
          <p className={ui.muted}>
            Почта: <b>{user.email || user.username}</b>. Входить можно по коду из письма или через Telegram — привяжите
            его в разделе <Link to="/app/studio">«Видео-студия»</Link>, если он ещё не привязан.
          </p>
        )}
      </div>
    </section>
  );
};

export default LoginSettings;
