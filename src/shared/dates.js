const MOSCOW_TZ = 'Europe/Moscow';
const MOSCOW_OFFSET = '+03:00';

const DAY_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: MOSCOW_TZ,
});

const INPUT_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: MOSCOW_TZ,
});

const toDate = (value) => {
  if (!value) return null;
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDay = (value) => {
  const date = toDate(value);
  return date ? DAY_FORMATTER.format(date) : '';
};

export const dateInputValue = (value) => {
  const date = toDate(value);
  return date ? INPUT_FORMATTER.format(date) : '';
};

export const startOfDayIso = (dateInput) =>
  dateInput ? new Date(`${dateInput}T00:00:00.000${MOSCOW_OFFSET}`).toISOString() : null;

export const endOfDayIso = (dateInput) =>
  dateInput ? new Date(`${dateInput}T23:59:59.999${MOSCOW_OFFSET}`).toISOString() : null;

export const describePeriod = (startsAt, endsAt) => {
  const from = formatDay(startsAt);
  const to = formatDay(endsAt);
  if (from && to) return `с ${from} по ${to}`;
  if (to) return `до ${to}`;
  if (from) return `с ${from}`;
  return '';
};

export const periodState = (startsAt, endsAt, now = new Date()) => {
  const from = toDate(startsAt);
  const to = toDate(endsAt);
  if (from && from > now) return 'upcoming';
  if (to && to < now) return 'ended';
  return 'current';
};

const SHORT_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  timeZone: MOSCOW_TZ,
});

export const formatShortDate = (value) => {
  const date = toDate(value);
  return date ? SHORT_FORMATTER.format(date).replace('.', '') : '';
};
