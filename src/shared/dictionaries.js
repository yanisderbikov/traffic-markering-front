import apiClient from '../apiClient';

// Русские подписи к enum'ам бэка. Ключи — ровно значения enum'ов из API,
// поэтому неизвестное значение показываем как есть, а не «undefined».

export const PLATFORM_LABELS = {
  TELEGRAM: 'Telegram',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE_SHORTS: 'YouTube Shorts',
};

export const VIEW_REGION_LABELS = {
  RUSSIA: 'только РФ',
  CIS: 'СНГ',
  WORLD: 'весь мир',
};

export const CAMPAIGN_STATUS_LABELS = {
  DRAFT: 'черновик',
  ACTIVE: 'активно',
  PAUSED: 'на паузе',
  COMPLETED: 'завершено',
};

export const APPLICATION_STATUS_LABELS = {
  PENDING: 'на рассмотрении',
  APPROVED: 'одобрен',
  REJECTED: 'отклонён',
  COMPLETED: 'завершён',
};

export const ROLE_LABELS = {
  CUSTOMER: 'заказчик',
  CREATOR: 'креатор',
  FINANCE_MANAGER: 'менеджер финансов',
  ADMIN: 'администратор',
  SUPER_ADMIN: 'супер-админ',
};

export const ASSIGNABLE_ROLES = ['CUSTOMER', 'CREATOR', 'FINANCE_MANAGER', 'ADMIN'];

// Вердикт антифрода по отклику.
export const FRAUD_STATUS_LABELS = {
  CLEAN: 'чисто',
  SUSPICIOUS: 'на проверке',
  FRAUD: 'накрутка',
  VERIFIED: 'проверен',
};

// Репутация креатора.
export const TRUST_LEVEL_LABELS = {
  NEW: 'новичок',
  TRUSTED: 'проверенный',
  RESTRICTED: 'ограничен',
  BLOCKED: 'заблокирован',
};

export const TRUST_LEVELS = ['NEW', 'TRUSTED', 'RESTRICTED', 'BLOCKED'];

export const WALLET_TRANSACTION_LABELS = {
  TOP_UP: 'пополнение',
  WITHDRAWAL: 'вывод USDT',
  ALLOCATION: 'резерв под объявление',
  RELEASE: 'возврат из объявления',
  EARNING: 'начисление за просмотры',
  PAYOUT: 'выплата USDT',
};

export const OPERATION_STATUS_LABELS = {
  DONE: 'проведена',
  PENDING: 'ожидает отправки',
  SENT: 'ждёт подтверждения',
  CONFIRMED: 'подтверждена',
  REJECTED: 'отклонена',
  CANCELLED: 'отменена',
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
