import { formatViews } from './money';
import { describePeriod } from './dates';
import { DEFAULT_VIEW_REGION, isWorldRegion, viewRegionHint, viewRegionLabel } from './viewRegion';

export const pluralize = (n, [one, few, many]) => {
  const abs = Math.abs(Number(n) || 0);
  const tail = abs % 100;
  const last = abs % 10;
  if (tail > 10 && tail < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};

export const formatSeconds = (seconds) => {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (!minutes) return `${rest} сек`;
  return rest ? `${minutes} мин ${rest} сек` : `${minutes} мин`;
};

export const formatFileSize = (bytes) => {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return '';
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1).replace('.', ',')} ГБ`;
};

export const campaignRequirements = (campaign) => {
  if (!campaign) return [];
  const rows = [];
  const region = campaign.viewRegion || DEFAULT_VIEW_REGION;
  const regionLabel = viewRegionLabel(region);
  rows.push({
    key: 'region',
    label: 'регион просмотров',
    value: regionLabel,
    short: isWorldRegion(region) ? '' : `просмотры: ${regionLabel}`,
    hint: viewRegionHint(region, campaign.platforms),
  });
  if (campaign.minVideoSeconds) {
    const length = `от ${formatSeconds(campaign.minVideoSeconds)}`;
    rows.push({ key: 'length', label: 'длина ролика', value: length, short: length });
  }
  if (campaign.minPaidViews) {
    const views = `от ${formatViews(campaign.minPaidViews)} просмотров`;
    rows.push({
      key: 'views',
      label: 'оплата',
      value: views,
      short: `оплата ${views}`,
      hint: 'ролик, набравший меньше, не оплачивается; после порога оплачиваются все просмотры',
    });
  }
  if (campaign.maxVideosPerCreator) {
    const limit = campaign.maxVideosPerCreator;
    const videos = `до ${limit} ${pluralize(limit, ['ролика', 'роликов', 'роликов'])}`;
    rows.push({
      key: 'limit',
      label: 'от одного криатора',
      value: videos,
      short: `${videos} от криатора`,
    });
  }
  const period = describePeriod(campaign.startsAt, campaign.endsAt);
  if (period) {
    rows.push({ key: 'period', label: 'приём откликов', value: period, short: period });
  }
  return rows;
};

export const requirementsSummary = (campaign) =>
  campaignRequirements(campaign)
    .map((row) => row.short)
    .filter(Boolean)
    .join(' · ');
