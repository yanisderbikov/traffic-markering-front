import axios from 'axios';
import apiClient from '../apiClient';
import { formatRubles } from './money';
import ui from './ui.module.css';

// «Ссылка и промокод»: оплата по снимку просмотров при подаче, база ставки + две независимые надбавки

export const SNAPSHOT = 'SNAPSHOT';

export const isSnapshot = (item) => item?.paymentModel === SNAPSHOT;

export const PROOF_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];
export const PROOF_MAX_BYTES = 200 * 1024 * 1024;

// Четыре варианта участия: всегда в одном порядке, от полной ставки к базовой
export const rateVariants = ({ base = 0, link = 0, promo = 0 }) =>
  [
    { key: 'full', withLink: true, withPromo: true, label: 'Ссылка и закреплённый промокод' },
    { key: 'link', withLink: true, withPromo: false, label: 'Только ссылка в профиле' },
    { key: 'promo', withLink: false, withPromo: true, label: 'Только промокод в закрепе' },
    { key: 'base', withLink: false, withPromo: false, label: 'Только рекламный ролик' },
  ]
    .filter((variant) => (!variant.withLink || link > 0) && (!variant.withPromo || promo > 0))
    .map((variant) => {
      const rate = base + (variant.withLink ? link : 0) + (variant.withPromo ? promo : 0);
      const full = base + link + promo;
      return { ...variant, rate, share: full > 0 ? Math.round((rate / full) * 100) : 100 };
    });

export const variantRate = ({ base = 0, link = 0, promo = 0 }, withLink, withPromo) =>
  base + (withLink ? link : 0) + (withPromo ? promo : 0);

// Ставки объявления: в карточке объявления надбавки приходят только если объявление их предлагает
export const campaignRates = (campaign) => ({
  base: campaign?.ratePerThousandKopecks ?? 0,
  link: campaign?.offersLink ? campaign.linkBonusPerThousandKopecks ?? 0 : 0,
  promo: campaign?.offersPromo ? campaign.promoBonusPerThousandKopecks ?? 0 : 0,
});

// Ставки, зафиксированные в работе криатора, когда он брал оффер
export const workRates = (placement) => ({
  base: placement?.baseRatePerThousandKopecks ?? 0,
  link: placement?.link?.offered ? placement.linkBonusPerThousandKopecks ?? 0 : 0,
  promo: placement?.promo?.offered ? placement.promoBonusPerThousandKopecks ?? 0 : 0,
});

export const fullRate = (rates) => rates.base + rates.link + rates.promo;

export const rateRange = (rates) => {
  const full = fullRate(rates);
  return full > rates.base
    ? `${formatRubles(rates.base)} – ${formatRubles(full)}`
    : formatRubles(rates.base);
};

export const PLACEMENT_CHIP = {
  NOT_SELECTED: ui.chipOutline,
  PENDING: ui.chipWarning,
  VERIFIED: ui.chipSuccess,
  EARNED: ui.chipSuccess,
  REJECTED: ui.chipDanger,
};

export const PLACEMENT_KIND_LABEL = {
  LINK: 'Ссылка в профиле',
  PROMO: 'Промокод в закрепе',
};

export const commentTemplate = ({ code, benefit, withLink }) =>
  [
    benefit ? `${benefit} по промокоду ${code}.` : `Промокод ${code}.`,
    withLink ? 'Ссылка — в профиле.' : '',
    'Реклама.',
  ]
    .filter(Boolean)
    .join(' ');

export const proofTypeError = (file) => {
  if (!PROOF_TYPES.includes(file.type)) {
    return 'Нужен скриншот (JPEG, PNG, WebP, HEIC) или запись экрана (MP4, MOV, WebM)';
  }
  if (file.size > PROOF_MAX_BYTES) return 'Файл больше 200 МБ';
  return '';
};

// Скриншот или запись экрана — прямо в хранилище; наружу отдаём ключ для подачи
export const uploadProof = async (file, onProgress) => {
  const res = await apiClient.api.presignPlacementProof({
    filename: file.name,
    contentType: file.type,
  });
  await axios.put(res.data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return res.data.key;
};
