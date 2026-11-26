import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import ui from '../../shared/ui.module.css';
import styles from './LoginSettings.module.css';

const http = apiClient.instance;
const telegramLinkApi = {
  status: () => http.get('/api/studio/telegram/link').then((r) => r.data),
  link: () => http.post('/api/studio/telegram/link').then((r) => r.data),
  unlink: () => http.delete('/api/studio/telegram/link'),
};

/**
 * Привязка Telegram для любой роли: через бота приходят уведомления о роликах и вход без почты.
 * Ссылка в бота готовится заранее — это обычная ссылка, браузер не блокирует её как всплывающее окно.
 */
const TelegramConnect = ({ telegramOnly }) => {
  const [status, setStatus] = useState(null);
  const [linkUrl, setLinkUrl] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      telegramLinkApi
        .status()
        .then((s) => {
          setStatus(s);
          return s;
        })
        .catch(() => null),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const needsLink = Boolean(status?.botEnabled && !status?.linked);
  useEffect(() => {
    if (!needsLink) {
      setLinkUrl(null);
      return undefined;
    }
    let timer;
    let cancelled = false;
    const prepare = () =>
      telegramLinkApi
        .link()
        .then((link) => {
          if (cancelled) return;
          setLinkUrl(link.url);
          const left = new Date(link.expiresAt).getTime() - Date.now() - 2 * 60 * 1000;
          timer = setTimeout(prepare, Math.max(left, 30 * 1000));
        })
        .catch(() => {
          if (!cancelled) timer = setTimeout(prepare, 30 * 1000);
        });
    prepare();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [needsLink]);

  // После Start в боте статус подтягивается сам
  useEffect(() => {
    if (!waiting) return undefined;
    const check = () =>
      load().then((s) => {
        if (s?.linked) {
          setWaiting(false);
          toast.success('Telegram привязан');
        }
      });
    const timer = setInterval(check, 3000);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
    };
  }, [waiting, load]);

  if (!status || !status.botEnabled) return null;

  const unlink = async () => {
    setBusy(true);
    try {
      await telegramLinkApi.unlink();
      toast.success('Telegram отвязан');
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отвязать Telegram'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.telegram}>
      <h3 className={styles.subTitle}>Telegram</h3>
      {status.linked ? (
        <>
          <p className={ui.muted}>
            Привязан{status.telegramUsername ? ` @${status.telegramUsername}` : ''}. Бот присылает уведомления о
            роликах, а войти можно кнопкой «Войти через Telegram» или прямо из бота.
          </p>
          <div className={styles.actions}>
            {status.botUrl && (
              <a className={ui.btnSecondary} href={status.botUrl} target="_blank" rel="noreferrer">
                Открыть бота
              </a>
            )}
            {!telegramOnly && (
              <button type="button" className={ui.btnGhost} disabled={busy} onClick={unlink}>
                Отвязать
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className={ui.muted}>
            Привяжите Telegram — бот будет сообщать о новых роликах и решениях по ним, а входить можно без кода
            из письма.
          </p>
          <div className={styles.actions}>
            {linkUrl ? (
              <a
                className={ui.btnPrimary}
                href={linkUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setWaiting(true)}
              >
                {waiting ? 'Открыть бота ещё раз' : 'Привязать Telegram'}
              </a>
            ) : (
              <button type="button" className={ui.btnPrimary} disabled>
                Привязать Telegram
              </button>
            )}
          </div>
          {waiting && <p className={ui.muted}>Нажмите Start в боте — статус обновится сам.</p>}
        </>
      )}
    </div>
  );
};

export default TelegramConnect;
