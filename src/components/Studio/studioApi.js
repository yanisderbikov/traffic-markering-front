import axios from 'axios';
import apiClient from '../../apiClient';

// Видео-студия: тонкая обёртка над /api/studio. Файлы уходят в хранилище напрямую
// по presigned-ссылке, бэкенду передаётся только ключ.

const EXT_TYPES = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export const contentTypeOf = (file) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  return EXT_TYPES[ext] || file.type || 'application/octet-stream';
};

export const isVideoFile = (file) => contentTypeOf(file).startsWith('video/');

const http = apiClient.instance;

export const studioApi = {
  overview: () => http.get('/api/studio/overview').then((r) => r.data),
  jobs: (filter = 'all') =>
    http.get('/api/studio/jobs', { params: { filter, limit: 50 } }).then((r) => r.data),
  createJobs: (body) => http.post('/api/studio/jobs', body).then((r) => r.data),
  cancel: (id) => http.post(`/api/studio/jobs/${id}/cancel`).then((r) => r.data),
  retry: (id, quality = null) =>
    http.post(`/api/studio/jobs/${id}/retry`, { quality }).then((r) => r.data),
  sendToTelegram: (id) => http.post(`/api/studio/jobs/${id}/telegram`).then((r) => r.data),
  assets: () => http.get('/api/studio/assets').then((r) => r.data),
  saveAsset: (body) => http.post('/api/studio/assets', body).then((r) => r.data),
  deleteAsset: (id) => http.delete(`/api/studio/assets/${id}`),
  templates: () => http.get('/api/studio/templates').then((r) => r.data),
  createTemplate: (body) => http.post('/api/studio/templates', body).then((r) => r.data),
  updateTemplate: (id, body) => http.put(`/api/studio/templates/${id}`, body).then((r) => r.data),
  deleteTemplate: (id) => http.delete(`/api/studio/templates/${id}`),
  setActiveTemplate: (templateId, favorite = false) =>
    http.post('/api/studio/templates/active', { templateId, favorite }),
  linkTelegram: () => http.post('/api/studio/telegram/link').then((r) => r.data),
  unlinkTelegram: () => http.delete('/api/studio/telegram/link'),

  /** Загружает файл в хранилище и возвращает ключ. purpose: SOURCE | BANNER | BACKGROUND */
  upload: async (file, purpose, onProgress) => {
    const contentType = contentTypeOf(file);
    const { data } = await http.post('/api/studio/uploads/presign', {
      filename: file.name,
      contentType,
      purpose,
      size: file.size,
    });
    // Отдельный axios без интерсепторов: в хранилище не нужен наш Authorization
    await axios.put(data.uploadUrl, file, {
      headers: { 'Content-Type': contentType },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data.key;
  },
};

export const DEFAULT_SETTINGS = {
  mode: 'none',
  place: 'bottom',
  align: 'center',
  start: null,
  duration: null,
  size: null,
  opacity: 100,
  overlayDim: 0,
  overlayDuck: 0,
  green: false,
  bannerAudio: null,
  bannerLoop: false,
  stripColor: '#1B1D1C',
  background: 'off',
  preset: 'random',
  color: '#101111',
  shape: 'fit',
  scale: 78,
  splitPlace: 'off',
  splitShare: 60,
  splitFit: 'fill',
  format: 'source',
  quality: '1080',
  sizeLimit: 0,
  exportProfile: 'single',
  captionPosition: 'bottom',
  captionScope: 'main',
  captionClock: 'output',
  captionStyle: 'outline',
  captionSize: 'medium',
  sourceStart: 0,
  sourceEnd: null,
  sourceVolume: 100,
  keepSource: false,
};

// Быстрый старт — те же режимы, что в Offer Studio
export const QUICK_STARTS = [
  {
    key: 'send',
    label: 'Для отправки',
    hint: '9:16, 720p',
    patch: { format: 'vertical', quality: '720', background: 'blur' },
  },
  {
    key: 'compact',
    label: 'Сжать до 25 МБ',
    hint: 'исходный кадр, 720p',
    patch: { format: 'source', quality: '720', sizeLimit: 25, background: 'off' },
  },
  {
    key: 'circle',
    label: 'Видео в круге',
    hint: '9:16, случайный фон',
    patch: { format: 'vertical', quality: '720', background: 'preset', preset: 'random', shape: 'circle' },
  },
  {
    key: 'split',
    label: 'Два видео',
    hint: '9:16, второе видео снизу',
    patch: { format: 'vertical', background: 'file', splitPlace: 'top', splitShare: 60, shape: 'fit' },
  },
];

export const STATUS_LABELS = {
  QUEUED: 'В очереди',
  RUNNING: 'Обработка',
  DONE: 'Готово',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменено',
  EXPIRED: 'Файл удалён',
};

export const FORMAT_LABELS = {
  source: 'Исходный',
  vertical: '9:16',
  square: '1:1',
  horizontal: '16:9',
  portrait: '4:5',
};

export const formatBytes = (bytes) => {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} МБ`;
};

// Время показываем в часовом поясе браузера
export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const parseTimecode = (value) => {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!text) return null;
  const parts = text.split(':');
  if (parts.length > 3 || parts.some((p) => p === '' || Number.isNaN(Number(p)))) return NaN;
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
};

export const formatTimecode = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return '';
  const whole = Math.floor(seconds);
  const fraction = Math.round((seconds - whole) * 10);
  const m = Math.floor(whole / 60);
  const s = String(whole % 60).padStart(2, '0');
  return `${m}:${s}${fraction ? `.${fraction}` : ''}`;
};
