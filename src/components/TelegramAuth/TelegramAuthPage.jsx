import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../shared/AuthLayout/AuthLayout';
import { applyAuth, rememberPendingTelegram, telegramAuthApi } from '../../shared/telegramAuth';
import ui from '../../shared/ui.module.css';
import form from '../shared/AuthLayout/authForm.module.css';

/**
 * Ссылка «Войти на сайт» из бота: /auth/telegram#секрет.
 * Секрет во фрагменте — он не уходит на сервер вместе со страницей и не попадает в Referer.
 */
const TelegramAuthPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const secret = window.location.hash.replace(/^#/, '');
    // Секрет одноразовый — убираем его из адресной строки и истории
    window.history.replaceState(null, '', window.location.pathname);
    if (!secret) {
      setState({ status: 'EXPIRED' });
      return;
    }
    telegramAuthApi
      .poll(secret)
      .then((result) => {
        if (result.status === 'DONE') {
          applyAuth(result.auth);
          navigate('/app', { replace: true });
        } else if (result.status === 'NEED_EMAIL') {
          rememberPendingTelegram(secret, result.telegram);
          navigate('/login', { replace: true });
        } else {
          setState({ status: result.status });
        }
      })
      .catch(() => setState({ status: 'ERROR' }));
  }, [navigate]);

  if (state.status === 'loading') {
    return <AuthLayout title="Входим через Telegram" caption="Секунду…" />;
  }

  return (
    <AuthLayout
      title="Ссылка не сработала"
      caption={
        state.status === 'ERROR'
          ? 'Не удалось связаться с сервером. Попробуйте ещё раз.'
          : 'Ссылка для входа одноразовая и действует 10 минут. Отправьте боту /login — он пришлёт новую.'
      }
    >
      <div className={form.actions}>
        <Link to="/login" className={`${ui.btnPrimary} ${ui.btnLarge} ${ui.btnBlock}`}>
          Ко входу
        </Link>
      </div>
    </AuthLayout>
  );
};

export default TelegramAuthPage;
