import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../shared/AuthLayout/AuthLayout';
import { isMiniApp, miniAppApi, startPath, webApp } from '../../shared/miniApp';
import { applyAuth, rememberPendingTelegram, telegramAuthApi } from '../../shared/telegramAuth';
import { storedReferralCode } from '../../shared/referral';
import { errorMessage } from '../../shared/auth';
import { useSession } from '../../shared/session';
import apiClient from '../../apiClient';
import ui from '../../shared/ui.module.css';
import form from '../shared/AuthLayout/authForm.module.css';

// Где человек «ещё не в кабинете»: после входа из Telegram отсюда ведём в /app
const ENTRY_PATHS = new Set(['/', '/login', '/register', '/adv', '/creator', '/auth/telegram']);

/**
 * Внутри мини-приложения Telegram входит сам: привязанный Telegram — сразу в кабинет,
 * новый — выбор: создать учётку креатора/рекламодателя или войти в свою по почте.
 * На обычном сайте просто отдаёт детей.
 */
const MiniAppGate = ({ children }) => {
  const inside = useRef(isMiniApp()).current;
  if (!inside) return children;
  return <MiniAppLogin>{children}</MiniAppLogin>;
};

const MiniAppLogin = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const [state, setState] = useState({ status: 'loading' });
  const [busy, setBusy] = useState('');
  const started = useRef(false);
  const initData = webApp()?.initData || '';

  const finish = useCallback(
    (result) => {
      applyAuth(result.auth);
      const target = startPath(result.startParam);
      if (target) navigate(target, { replace: true });
      else if (ENTRY_PATHS.has(location.pathname)) navigate('/app', { replace: true });
      setState({ status: 'ready' });
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const app = webApp();
    app?.ready?.();
    app?.expand?.();
    // Подписанные данные Telegram больше не нужны в адресе
    if (/tgWebAppData=/.test(window.location.hash)) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }
    if (!initData) {
      // SDK не загрузился — работаем как обычный сайт
      setState({ status: 'ready' });
      return;
    }
    miniAppApi
      .login(initData)
      .then((result) => {
        if (result.status === 'DONE') finish(result);
        else setState({ status: 'choose', telegram: result.telegram, startParam: result.startParam });
      })
      .catch((error) => {
        toast.error(errorMessage(error, 'Не удалось войти через Telegram'));
        setState({ status: 'ready' });
      });
  }, [initData, finish]);

  const choose = async (action) => {
    setBusy(action);
    try {
      const result = await miniAppApi.login(initData, action, storedReferralCode());
      if (result.status === 'DONE') {
        finish(result);
        return;
      }
      if (result.status === 'NEED_EMAIL') {
        if (apiClient.hasLiveToken()) {
          // Уже вошли по почте в этом окне — привязываем сразу и входим заново уже через Telegram
          await telegramAuthApi.attach(result.secret);
          const again = await miniAppApi.login(initData);
          if (again.status === 'DONE') {
            toast.success('Telegram привязан к аккаунту');
            finish(again);
            return;
          }
        }
        rememberPendingTelegram(result.secret, result.telegram);
        setState({ status: 'ready' });
        navigate('/login', { replace: true });
      }
    } catch (error) {
      toast.error(errorMessage(error, 'Не получилось — попробуйте ещё раз'));
    } finally {
      setBusy('');
    }
  };

  if (state.status === 'ready') return children;

  if (state.status === 'loading') {
    return <AuthLayout title="Входим через Telegram" caption="Секунду…" />;
  }

  const signedIn = session.status === 'ready' && session.user;
  const button = `${ui.btnPrimary} ${ui.btnLarge} ${ui.btnBlock}`;
  const secondary = `${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock}`;

  return (
    <AuthLayout
      title="Добро пожаловать в Offer"
      caption={`${state.telegram ? `${state.telegram} ещё` : 'Этот Telegram ещё'} не привязан к аккаунту. Создайте новый — почта не нужна — или войдите в свой.`}
    >
      <div className={form.actions}>
        {signedIn && (
          <button type="button" className={button} disabled={Boolean(busy)} onClick={() => choose('have')}>
            {busy === 'have' ? 'Привязываем…' : `Привязать к аккаунту «${session.user.name}»`}
          </button>
        )}
        <button type="button" className={button} disabled={Boolean(busy)} onClick={() => choose('cr')}>
          {busy === 'cr' ? 'Создаём…' : 'Я креатор — создать аккаунт'}
        </button>
        <button type="button" className={button} disabled={Boolean(busy)} onClick={() => choose('cu')}>
          {busy === 'cu' ? 'Создаём…' : 'Я рекламодатель — создать аккаунт'}
        </button>
        {!signedIn && (
          <button type="button" className={secondary} disabled={Boolean(busy)} onClick={() => choose('have')}>
            {busy === 'have' ? 'Секунду…' : 'У меня есть аккаунт с почтой'}
          </button>
        )}
      </div>
    </AuthLayout>
  );
};

export default MiniAppGate;
