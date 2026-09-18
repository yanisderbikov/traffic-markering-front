import { PLATFORM_LABELS, VIEW_REGION_LABELS } from './dictionaries';

export const VIEW_REGIONS = ['RUSSIA', 'CIS', 'WORLD'];

export const DEFAULT_VIEW_REGION = 'WORLD';

const GEOGRAPHY_PLATFORMS = ['YOUTUBE_SHORTS'];

const REGION_VIEWS = {
  RUSSIA: 'просмотры из России',
  CIS: 'просмотры из России и стран СНГ',
  WORLD: 'все просмотры, откуда бы они ни были',
};

export const viewRegionLabel = (region) => VIEW_REGION_LABELS[region] || region || '';

export const isWorldRegion = (region) => !region || region === 'WORLD';

export const reportsViewGeography = (platform) => GEOGRAPHY_PLATFORMS.includes(platform);

export const platformsWithoutGeography = (platforms) =>
  (Array.isArray(platforms) ? platforms : []).filter((platform) => !reportsViewGeography(platform));

export const platformLabels = (platforms) =>
  (Array.isArray(platforms) ? platforms : [])
    .map((platform) => PLATFORM_LABELS[platform] || platform)
    .join(' и ');

export const describeViewRegion = (region) =>
  REGION_VIEWS[region] || REGION_VIEWS[DEFAULT_VIEW_REGION];

export const viewRegionHint = (region, platforms) => {
  if (isWorldRegion(region)) return `оплачиваются ${describeViewRegion(region)}`;
  const blind = platformsWithoutGeography(platforms);
  const base = `оплачиваются только ${describeViewRegion(region)}`;
  if (!blind.length) return base;
  const verb = blind.length > 1 ? 'не отдают' : 'не отдаёт';
  return `${base}; ${platformLabels(blind)} географию просмотров ${verb} — ролики оттуда не оплачиваются`;
};

export const platformGeographyWarning = (region, platform) => {
  if (isWorldRegion(region) || !platform || reportsViewGeography(platform)) return '';
  return `${PLATFORM_LABELS[platform] || platform} не отдаёт географию просмотров, а заказчик платит только за ${describeViewRegion(region)} — просмотры по этому ролику не оплатятся.`;
};
