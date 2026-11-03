// Хелперы графиков дашборда: шаги ряда, подписи дат и «круглые» деления оси.
// Чистые функции без React.

export const STEPS = [
  { key: 'DAY', label: 'День' },
  { key: 'WEEK', label: 'Неделя' },
  { key: 'MONTH', label: 'Месяц' },
];

// days = null — «всё время». Слишком мелкий шаг даёт сотни столбиков толщиной в пиксель,
// слишком крупный — одну-две точки, поэтому такие сочетания выключаем.
export const isStepAllowed = (step, days) => {
  if (step === 'DAY') return days != null && days <= 90;
  if (step === 'WEEK') return days == null || days >= 14;
  return days == null || days >= 60;
};

export const defaultStep = (days) => {
  if (days != null && days <= 30) return 'DAY';
  if (days != null && days <= 90) return 'WEEK';
  return days == null ? 'MONTH' : 'WEEK';
};

const DAY_MONTH = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const MONTH_SHORT = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
const MONTH_YEAR = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

// «5 авг.» → «5 авг», «5 авг. 2026 г.» → «5 авг 2026»: Intl ставит точки после сокращений.
const clean = (text) => text.replace(/(\d{4})\s?г\.$/, '$1').replace(/\.(?=\s|$)/g, '');

// Конец шага — начало следующего, для подписи берём последний день шага.
const lastDay = (end) => new Date(new Date(end).getTime() - 1);

/** Короткая подпись под осью: «3 нояб», для месяцев — «окт». */
export const axisLabel = (point, step) =>
  clean(step === 'MONTH' ? MONTH_SHORT.format(new Date(point.start)) : DAY_MONTH.format(new Date(point.start)));

/** Полная подпись шага для подсказки и таблицы. */
export const bucketLabel = (point, step) => {
  const start = new Date(point.start);
  if (step === 'DAY') return clean(DAY_MONTH_YEAR.format(start));
  if (step === 'MONTH') return clean(MONTH_YEAR.format(start));
  return `${clean(DAY_MONTH.format(start))} – ${clean(DAY_MONTH_YEAR.format(lastDay(point.end)))}`;
};

/** Последний шаг ещё идёт: цифры по нему неполные. */
export const isOngoing = (point, now = Date.now()) => new Date(point.end).getTime() > now;

/**
 * Деления оси от нуля до «круглого» максимума: шаг 1, 2, 2.5 или 5 × 10^k.
 * Ровно count интервалов, чтобы сетка не прыгала по высоте между графиками.
 */
export const niceTicks = (max, count = 3, integer = false) => {
  if (!(max > 0)) return [0, 1];
  // Штучные величины не бывают дробными: при маленьком максимуме — деление на каждую единицу.
  if (integer && max <= count) {
    return Array.from({ length: Math.ceil(max) + 1 }, (_, i) => i);
  }
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10]
    .map((m) => m * power)
    .find((s) => s >= raw && (!integer || Number.isInteger(s)));
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step * 1000) / 1000);
};

export const sumOf = (points, key) =>
  points.reduce((sum, point) => sum + (Number(point[key]) || 0), 0);
