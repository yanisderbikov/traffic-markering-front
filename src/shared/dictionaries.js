import apiClient from '../apiClient';

// Русские подписи к enum'ам бэка. Ключи — ровно значения enum'ов из API,
// поэтому неизвестное значение показываем как есть, а не «undefined».

export const PLATFORM_LABELS = {
  TELEGRAM: 'Telegram',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE_SHORTS: 'YouTube Shorts',
};

export const CAMPAIGN_STATUS_LABELS = {
  DRAFT: 'черновик',
  ACTIVE: 'активно',
  PAUSED: 'на паузе',
  COMPLETED: 'завершено',
};

// Регион, по которому считаются оплачиваемые просмотры оффера.
export const REGION_LABELS = {
  RUSSIA: 'только РФ',
  CIS: 'СНГ',
  WORLDWIDE: 'весь мир',
};

// Готовый список для <select> — порядок фиксированный, чтобы не прыгал между рендерами.
export const REGION_OPTIONS = Object.entries(REGION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const APPLICATION_STATUS_LABELS = {
  PENDING: 'на рассмотрении',
  APPROVED: 'одобрен',
  REJECTED: 'отклонён',
  COMPLETED: 'завершён',
};

export const ROLE_LABELS = {
  CUSTOMER: 'заказчик',
  CREATOR: 'криатор',
  ADMIN: 'администратор',
};

export const formatDate = (value) => {
  if (!value) return '';
  // Бэк может отдавать Instant как epoch-секунды — переводим в миллисекунды.
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });
};

// Для запросов мимо сгенерированного клиента (apiClient.instance.get/post и т.п.),
// где securityWorker не подключается.
export const authHeaders = () => {
  const token = apiClient.getToken ? apiClient.getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
