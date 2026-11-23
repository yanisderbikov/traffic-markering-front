import apiClient from '../apiClient';

// Вход через Telegram-бота. Браузер держит секрет попытки и по нему забирает токен,
// когда человек подтвердит вход в боте.

const http = apiClient.instance;
const PENDING_KEY = 'tg_auth_pending';

export const telegramAuthApi = {
  start: (body = {}) => http.post('/api/auth/telegram/start', body).then((r) => r.data),
  poll: (secret) => http.post('/api/auth/telegram/poll', { secret }).then((r) => r.data),
  attach: (secret) => http.post('/api/auth/telegram/attach', { secret }).then((r) => r.data),
  addEmail: (email, code) => http.post('/api/auth/email', { email, code }).then((r) => r.data),
};

const storage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** Telegram подтверждён, но учётки нет: после входа по почте он привяжется к ней */
export const rememberPendingTelegram = (secret, telegram) => {
  try {
    storage()?.setItem(PENDING_KEY, JSON.stringify({ secret, telegram }));
  } catch {
    // приватный режим — просто не запомним
  }
};

export const pendingTelegram = () => {
  try {
    const raw = storage()?.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const forgetPendingTelegram = () => {
  try {
    storage()?.removeItem(PENDING_KEY);
  } catch {
    // нечего чистить
  }
};

/** После входа по почте: привязать Telegram из бота, если он ждёт. Возвращает его @ник или null */
export const attachPendingTelegram = async () => {
  const pending = pendingTelegram();
  if (!pending) return null;
  forgetPendingTelegram();
  try {
    const result = await telegramAuthApi.attach(pending.secret);
    return result.telegram || pending.telegram || 'Telegram';
  } catch {
    return null;
  }
};

export const applyAuth = (auth) => {
  if (!auth?.token) throw new Error('В ответе сервера нет токена');
  apiClient.setToken(auth.token);
};
