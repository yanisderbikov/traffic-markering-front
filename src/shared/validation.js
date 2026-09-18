const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_RE = /^(?:https?:\/\/)?(?:t\.me\/|@)?[a-zA-Z0-9_]{5,32}$/;
const CODE_RE = /^\d{6}$/;
const WEBSITE_RE = /^(?:https?:\/\/)?[^\s/.]+(?:\.[^\s/.]+)+(?:\/\S*)?$/;

export const validateEmail = (value) => {
  const email = value.trim();
  if (!email) return 'Укажите почту';
  if (!EMAIL_RE.test(email)) return 'Похоже, в почте опечатка';
  return '';
};

export const validateCode = (value) => {
  const code = value.trim();
  if (!code) return 'Введите код из письма';
  if (!CODE_RE.test(code)) return 'Код — 6 цифр';
  return '';
};

export const validateRequired = (value, message) => (value.trim() ? '' : message);

export const validateTelegram = (value) => {
  const handle = value.trim();
  if (!handle) return '';
  return TELEGRAM_RE.test(handle) ? '' : 'Ник Telegram: от 5 символов, латиница, цифры и _';
};

export const validateWebsite = (value) => {
  const site = value.trim();
  if (!site) return '';
  return WEBSITE_RE.test(site) ? '' : 'Укажите адрес сайта, например example.ru';
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export const clearFieldError = (setErrors, name) =>
  setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
