// Деньги везде (в БД, API и здесь) считаются в копейках — целыми числами,
// чтобы не ловить ошибки округления float. В рубли переводим только для показа.

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const VIEWS_FORMATTER = new Intl.NumberFormat('ru-RU');

/** Копейки → рубли числом: 150000 → 1500. */
export const kopecksToRub = (kopecks) => {
  if (kopecks == null) return null;
  return Number(kopecks) / 100;
};

/** Копейки → строка для показа: 150000 → «1 500 ₽». */
export const formatRubles = (kopecks) => {
  if (kopecks == null) return '—';
  return `${RUB_FORMATTER.format(Number(kopecks) / 100)} ₽`;
};

/**
 * Строка из инпута → копейки. Пользователь пишет и «1500», и «1500,50»,
 * поэтому запятую приводим к точке; пустое поле — это null, а не ноль,
 * иначе форма отправит на бэк нулевую ставку вместо «поле не заполнено».
 */
export const rubToKopecks = (value) => {
  if (value == null) return null;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const rubles = Number(normalized);
  if (!Number.isFinite(rubles)) return null;
  return Math.round(rubles * 100);
};

/**
 * Строка из денежного инпута → она же с разрядами: «1500000» → «1 500 000»,
 * «1500,5» → «1 500,5». Хвостовая запятая не теряется, чтобы дробную часть
 * можно было допечатать; дробь режется до копеек.
 */
export const formatRubInput = (value) => {
  if (value == null) return '';
  const raw = String(value).replace(/\./g, ',').replace(/[^\d,]/g, '');
  if (raw === '') return '';
  const [integer, ...fractionParts] = raw.split(',');
  const grouped = integer
    .replace(/^0+(?=\d)/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (fractionParts.length === 0) return grouped;
  return `${grouped || '0'},${fractionParts.join('').slice(0, 2)}`;
};

/** Копейки со знаком → «+1 500 ₽» или «−300 ₽»: для журнала операций. */
export const signedRubles = (kopecks) => {
  const amount = Number(kopecks) || 0;
  return `${amount < 0 ? '−' : '+'}${formatRubles(Math.abs(amount))}`;
};

/** Просмотры → строка с разрядами: 12400 → «12 400». */
export const formatViews = (n) => {
  if (n == null) return '—';
  return VIEWS_FORMATTER.format(Number(n));
};

export const formatIntInput = (value) => {
  if (value == null) return '';
  const digits = String(value).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const parseIntInput = (value) => {
  if (value == null) return null;
  const digits = String(value).replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
};

const COMPACT_RUB_FORMATTER = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

const COMPACT_RUB_UNITS = [
  { size: 1_000_000_000, suffix: ' млрд ₽' },
  { size: 1_000_000, suffix: ' млн ₽' },
  { size: 1_000, suffix: ' к₽' },
];

const compactRubUnit = (rubles) => {
  const index = COMPACT_RUB_UNITS.findIndex(({ size }) => rubles >= size);
  if (index === -1) return null;
  const roundsToNextUnit = index > 0 && rubles / COMPACT_RUB_UNITS[index].size >= 999.95;
  return COMPACT_RUB_UNITS[roundsToNextUnit ? index - 1 : index];
};

export const formatRublesCompact = (kopecks) => {
  if (kopecks == null) return '—';
  const rubles = Number(kopecks) / 100;
  const unit = compactRubUnit(Math.abs(rubles));
  if (!unit) return formatRubles(kopecks);
  return `${COMPACT_RUB_FORMATTER.format(rubles / unit.size)}${unit.suffix}`;
};

const USDT_FORMATTER = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const RATE_FORMATTER = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export const kopecksToUsdt = (kopecks, rubPerUsdt) => {
  if (kopecks == null || !rubPerUsdt) return null;
  return Math.ceil(Number((Math.abs(Number(kopecks)) / rubPerUsdt).toFixed(6))) / 100;
};

export const formatUsdt = (amount) => {
  if (amount == null) return '—';
  return `${USDT_FORMATTER.format(amount)} USDT`;
};

export const formatRate = (rubPerUsdt) => `${RATE_FORMATTER.format(rubPerUsdt)} ₽`;

export const commissionOf = (kopecks, percent) => {
  const amount = Number(kopecks) || 0;
  const rate = Number(percent) || 0;
  if (amount <= 0 || rate <= 0) return 0;
  return Math.round((amount * rate) / 100);
};

export const formatPercent = (percent) =>
  `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(Number(percent) || 0)}%`;
