import { Api } from './shared/api/api.gen.ts';
import config from './config';
import { jwtDecode } from 'jwt-decode';

// Храним JWT в localStorage (без куки)
export const jwt_key = 'jwt_authentication';

const getStoredToken = () => {
    try {
        return localStorage.getItem(jwt_key);
    } catch {
        return null;
    }
};

const setStoredToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(jwt_key, token);
        } else {
            localStorage.removeItem(jwt_key);
        }
    } catch (e) {
        // Приватный режим Safari режет localStorage — не падаем, просто живём без токена
        console.warn('localStorage недоступен:', e);
    }
};

// Функция, которая будет добавлять токен в каждый запрос
const securityWorker = (securityData) => {
    const token = getStoredToken();
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }
    return {};
};

// Инициализируем API-клиент с базовым URL и securityWorker (без withCredentials)
const apiClient = new Api({
    baseURL: config.apiUrl,
    securityWorker,
});

apiClient.instance.interceptors.request.use(
    (config) => {
        const token = getStoredToken();
        if (token && config.headers && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const tokenListeners = new Set();

apiClient.subscribeToken = (listener) => {
    tokenListeners.add(listener);
    return () => tokenListeners.delete(listener);
};

// Добавляем метод для установки JWT токена
apiClient.setToken = (token) => {
    setStoredToken(token);
    apiClient.setSecurityData(token);
    tokenListeners.forEach((listener) => listener());
};

// Добавляем метод для получения JWT токена
apiClient.getToken = () => getStoredToken();

// Очистка токена (логаут)
apiClient.clearToken = () => {
    setStoredToken(null);
    apiClient.setSecurityData(null);
    tokenListeners.forEach((listener) => listener());
};

// Есть ли живой токен: существует, парсится и не истёк.
apiClient.hasLiveToken = () => {
    const token = getStoredToken();
    if (!token) return false;
    try {
        const { exp } = jwtDecode(token);
        return !exp || exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

// Роль и имя достаём из самого токена — лишний запрос /api/auth/me не нужен.
apiClient.getJwtMetadata = () => {
    const token = getStoredToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        return {
            role: decoded.role || null,
            name: decoded.name || null,
            username: decoded.sub || null,
            raw: decoded, // полный набор claim'ов — на случай, если понадобится что-то помимо трёх полей выше
        };
    } catch (e) {
        console.error('Не удалось разобрать JWT:', e);
        return null;
    }
};

apiClient.instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Логируем только то, что нужно для разбора сбоя: какой запрос и что ответил
            // сервер. Целиком error.response.config в консоль не кладём — в его заголовках
            // едет `Authorization: Bearer ...`, а консоль читают через плечо и шлют скриншотами.
            console.error('Ошибка запроса:', {
                method: error.response.config?.method,
                url: error.response.config?.url,
                status: error.response.status,
                data: error.response.data,
            });

            // 401/403 в приватной зоне — на логин, но только если токена нет или он протух.
            // Валидный токен без нужной роли на логин не бросаем (иначе петля логина),
            // такие случаи разруливает гвард секций в AppLayout.
            // Публичные страницы (доска, карточка объявления) на логин не бросаем.
            const path = window.location.pathname;
            const status = error.response.status;
            if ((status === 401 || status === 403) && path.startsWith('/app')) {
                if (!apiClient.hasLiveToken()) {
                    const from = encodeURIComponent(path + window.location.search);
                    window.location.href = `/login?from=${from}`;
                    return;
                }
            }
        }

        // Свои сбои axios формулирует по-английски («Network Error»), а сервисный
        // entry point бэка отдаёт `{"error":"invalid auth token"}`. Формы показывают
        // этот текст пользователю как есть, поэтому русскую замену подставляем здесь,
        // в одном месте, — иначе её пришлось бы дублировать в каждом компоненте.
        // Осмысленный ответ бэка (поле `message`) не трогаем: он уже по-русски.
        if (!error.response?.data?.message) {
            const fallback = !error.response
                ? 'Сервер недоступен: проверьте соединение и попробуйте ещё раз.'
                : error.response.status >= 500
                    ? 'Сервер не смог обработать запрос, попробуйте позже.'
                    : 'Запрос отклонён сервером.';
            if (error.response) {
                // Исходное тело уже ушло в console.error выше, так что показываем русский текст.
                error.response.data = { message: fallback };
            }
            error.message = fallback;
        }

        // Прокидываем ошибку дальше для локальной обработки
        return Promise.reject(error);
    }
);

export default apiClient;
