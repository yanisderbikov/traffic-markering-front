import apiClient from '../apiClient';

// Сайт, открытый мини-приложением Telegram (кнопка «Offer» в боте).
// Telegram передаёт подписанные данные в #tgWebAppData=…; бэк проверяет подпись и сразу пускает в кабинет.

const FLAG_KEY = 'tg_mini_app';
const SCRIPT_URL = 'https://telegram.org/js/telegram-web-app.js';

const launchedNow = () => /[#&]tgWebAppData=/.test(window.location.hash);

export const isMiniApp = () => {
  try {
    if (sessionStorage.getItem(FLAG_KEY) === '1') return true;
  } catch {
    // нет доступа к хранилищу — смотрим на адрес
  }
  return launchedNow();
};

export const webApp = () => window.Telegram?.WebApp || null;

/** Подключает SDK Telegram только внутри мини-приложения; на обычном сайте ничего не грузим */
export const loadMiniApp = () => {
  if (!isMiniApp()) return Promise.resolve(null);
  try {
    sessionStorage.setItem(FLAG_KEY, '1');
  } catch {
    // переживём без флага: при перезагрузке внутри Telegram хэш придёт снова
  }
  if (webApp()) return Promise.resolve(webApp());
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    const done = () => resolve(webApp());
    script.onload = done;
    script.onerror = done;
    // Медленная сеть не должна держать пустой экран
    setTimeout(done, 5000);
    document.head.appendChild(script);
  });
};

export const miniAppApi = {
  login: (initData, action, referralCode) =>
    apiClient.instance
      .post('/api/auth/telegram/webapp', { initData, action, referralCode: referralCode || undefined })
      .then((r) => r.data),
};

/** startapp=studio → /app/studio; startapp=campaigns-new → /app/campaigns/new */
export const startPath = (startParam) =>
  startParam && /^[a-z0-9_-]{1,64}$/.test(startParam)
    ? `/app/${startParam.replace(/-/g, '/')}`
    : null;
