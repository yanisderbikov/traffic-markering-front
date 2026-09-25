import { DEFAULT_VIEW_REGION, VIEW_REGIONS } from '../../shared/viewRegion';
import {
  formatIntInput,
  formatRubInput,
  formatViews,
  kopecksToRub,
  parseIntInput,
  rubToKopecks,
} from '../../shared/money';
import { dateInputValue, endOfDayIso, startOfDayIso } from '../../shared/dates';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const MATERIAL_MAX_BYTES = 100 * 1024 * 1024;
export const MATERIALS_MAX = 10;

export const emptyForm = {
  title: '',
  description: '',
  photoKey: '',
  rateRub: '',
  budgetRub: '',
  minPayoutRub: '',
  platforms: [],
  viewRegion: DEFAULT_VIEW_REGION,
  minVideoSeconds: '',
  minPaidViews: '',
  maxVideosPerCreator: '',
  startsOn: '',
  endsOn: '',
  materials: [],
};

export const FORM_FIELDS = Object.keys(emptyForm);

export const MEDIAN_TOLERANCE_PERCENT = 5;
export const SUGGESTED_RATE_MARKUP = 1.05;

export const CAMPAIGN_STEPS = [
  {
    id: 'brief',
    title: 'Бриф',
    heading: 'Расскажите о задаче',
    fields: ['title', 'description', 'photoKey', 'materials'],
  },
  {
    id: 'terms',
    title: 'Площадки и условия',
    heading: 'Где и как снимать',
    fields: ['platforms', 'viewRegion', 'startsOn', 'endsOn', 'minVideoSeconds', 'maxVideosPerCreator'],
  },
  {
    id: 'budget',
    title: 'Бюджет',
    heading: 'Сколько платите',
    fields: ['rateRub', 'budgetRub', 'minPayoutRub', 'minPaidViews'],
  },
  {
    id: 'launch',
    title: 'Проверка и запуск',
    heading: 'Проверьте кампанию',
    fields: [],
  },
];

export const FORM_STEPS = CAMPAIGN_STEPS.filter((step) => step.fields.length > 0);

const moneyFilled = (value) => rubToKopecks(value) != null;

const REQUIRED = {
  title: {
    label: 'название',
    message: 'Укажите название',
    filled: (form) => Boolean(form.title.trim()),
  },
  description: {
    label: 'описание',
    message: 'Опишите задачу для креатора',
    filled: (form) => Boolean(form.description.trim()),
  },
  photoKey: {
    label: 'обложка',
    message: 'Загрузите обложку',
    filled: (form) => Boolean(form.photoKey),
  },
  platforms: {
    label: 'площадки',
    message: 'Выберите хотя бы одну площадку',
    filled: (form) => form.platforms.length > 0,
  },
  viewRegion: {
    label: 'регион просмотров',
    message: 'Выберите регион просмотров',
    filled: (form) => VIEW_REGIONS.includes(form.viewRegion),
  },
  rateRub: {
    label: 'ставка',
    message: 'Укажите ставку за 1 000 просмотров',
    filled: (form) => moneyFilled(form.rateRub),
  },
  budgetRub: {
    label: 'бюджет',
    message: 'Укажите бюджет',
    filled: (form) => moneyFilled(form.budgetRub),
  },
  minPayoutRub: {
    label: 'порог вывода',
    message: 'Укажите порог вывода',
    filled: (form) => moneyFilled(form.minPayoutRub),
  },
};

const OPTIONAL_LABELS = {
  materials: 'материалы',
  startsOn: 'начало приёма',
  endsOn: 'окончание приёма',
  minVideoSeconds: 'длина ролика',
  maxVideosPerCreator: 'лимит роликов',
  minPaidViews: 'порог просмотров',
};

export const fieldLabel = (field) => REQUIRED[field]?.label ?? OPTIONAL_LABELS[field];

export const isRequired = (field) => Boolean(REQUIRED[field]);

export const missingFields = (form, fields = FORM_FIELDS) =>
  fields.filter((field) => REQUIRED[field] && !REQUIRED[field].filled(form));

export const missingLabels = (form, fields = FORM_FIELDS) =>
  missingFields(form, fields).map((field) => REQUIRED[field].label);

export const firstIncompleteStep = (form) => {
  const index = CAMPAIGN_STEPS.findIndex((step) => missingFields(form, step.fields).length > 0);
  return index === -1 ? CAMPAIGN_STEPS.length - 1 : index;
};

const positiveOrEmpty = (value, message) => (value != null && value <= 0 ? message : '');

const formatError = (form, field, budgetError) => {
  switch (field) {
    case 'rateRub':
      return positiveOrEmpty(rubToKopecks(form.rateRub), 'Ставка должна быть больше нуля');
    case 'budgetRub': {
      const budget = rubToKopecks(form.budgetRub);
      return budget == null ? '' : budgetError(budget);
    }
    case 'minPayoutRub':
      return positiveOrEmpty(rubToKopecks(form.minPayoutRub), 'Порог вывода должен быть больше нуля');
    case 'minVideoSeconds':
      return positiveOrEmpty(parseIntInput(form.minVideoSeconds), 'Длина ролика — целое число секунд');
    case 'minPaidViews':
      return positiveOrEmpty(parseIntInput(form.minPaidViews), 'Порог просмотров должен быть больше нуля');
    case 'maxVideosPerCreator':
      return positiveOrEmpty(
        parseIntInput(form.maxVideosPerCreator),
        'Лимит роликов должен быть больше нуля'
      );
    case 'endsOn': {
      const startsAt = startOfDayIso(form.startsOn);
      const endsAt = endOfDayIso(form.endsOn);
      return startsAt && endsAt && endsAt < startsAt ? 'Окончание приёма раньше его начала' : '';
    }
    default:
      return '';
  }
};

export const validateCampaign = (form, fields, { requireFilled, budgetError }) =>
  Object.fromEntries(
    fields.map((field) => {
      const rule = REQUIRED[field];
      if (requireFilled && rule && !rule.filled(form)) return [field, rule.message];
      return [field, formatError(form, field, budgetError)];
    })
  );

const kopecksToInput = (kopecks) =>
  kopecks == null ? '' : formatRubInput(String(kopecksToRub(kopecks)));

const intToInput = (value) => (value == null ? '' : formatIntInput(String(value)));

const materialFromDto = (material) => ({
  kind: material.kind,
  title: material.title || '',
  url: material.url || '',
  fileKey: material.fileKey || '',
  contentType: material.contentType || '',
  sizeBytes: material.sizeBytes ?? null,
  opensInBrowser: Boolean(material.opensInBrowser),
});

const materialToRequest = (material) =>
  material.kind === 'FILE'
    ? {
        kind: 'FILE',
        title: material.title,
        fileKey: material.fileKey,
        contentType: material.contentType || null,
        sizeBytes: material.sizeBytes,
      }
    : { kind: 'LINK', title: material.title, url: material.url };

export const formFromCampaign = (campaign) => ({
  title: campaign.title || '',
  description: campaign.description || '',
  photoKey: campaign.photoKey || '',
  rateRub: kopecksToInput(campaign.ratePerThousandKopecks),
  budgetRub: kopecksToInput(campaign.budgetKopecks),
  minPayoutRub: kopecksToInput(campaign.minPayoutKopecks),
  platforms: Array.isArray(campaign.platforms) ? campaign.platforms : [],
  viewRegion: campaign.viewRegion || DEFAULT_VIEW_REGION,
  minVideoSeconds: intToInput(campaign.minVideoSeconds),
  minPaidViews: intToInput(campaign.minPaidViews),
  maxVideosPerCreator: intToInput(campaign.maxVideosPerCreator),
  startsOn: dateInputValue(campaign.startsAt),
  endsOn: dateInputValue(campaign.endsAt),
  materials: Array.isArray(campaign.materials) ? campaign.materials.map(materialFromDto) : [],
});

export const formToRequest = (form) => ({
  title: form.title.trim() || null,
  description: form.description.trim() || null,
  photoKey: form.photoKey || null,
  ratePerThousandKopecks: rubToKopecks(form.rateRub),
  budgetKopecks: rubToKopecks(form.budgetRub),
  minPayoutKopecks: rubToKopecks(form.minPayoutRub),
  platforms: form.platforms,
  viewRegion: form.viewRegion,
  minVideoSeconds: parseIntInput(form.minVideoSeconds),
  minPaidViews: parseIntInput(form.minPaidViews),
  maxVideosPerCreator: parseIntInput(form.maxVideosPerCreator),
  startsAt: startOfDayIso(form.startsOn),
  endsAt: endOfDayIso(form.endsOn),
  materials: form.materials.map(materialToRequest),
});

export const isUnfinishedDraft = (campaign) =>
  campaign.status === 'DRAFT' && !(campaign.applicationsCount > 0);

const CONTENT_FIELDS = FORM_FIELDS.filter((field) => field !== 'platforms' && field !== 'viewRegion');

export const isBlankDraft = (campaign) => {
  const form = formFromCampaign(campaign);
  return CONTENT_FIELDS.every((field) => sameValue(form[field], emptyForm[field]));
};

export const sameValue = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
  if (a.length !== b.length) return false;
  return a.every((item, index) =>
    item && typeof item === 'object'
      ? JSON.stringify(item) === JSON.stringify(b[index])
      : b.includes(item)
  );
};

export const normalizeLink = (value) => {
  const raw = value.trim();
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes('.') ? url.toString() : '';
  } catch {
    return '';
  }
};

export const suggestedRateInput = (medianKopecks) =>
  kopecksToInput(Math.round((medianKopecks * SUGGESTED_RATE_MARKUP) / 100) * 100);

export const compareToMedian = (kopecks, medianKopecks) => {
  if (!(kopecks > 0) || !(medianKopecks > 0)) return null;
  const percent = Math.round((kopecks / medianKopecks - 1) * 100);
  if (percent > MEDIAN_TOLERANCE_PERCENT) return { percent, tone: 'above' };
  if (percent < -MEDIAN_TOLERANCE_PERCENT) return { percent, tone: 'below' };
  return { percent, tone: 'even' };
};

export const formatCompactViews = (views) => {
  const n = Number(views) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')} млн`;
  if (n >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  return formatViews(n);
};
