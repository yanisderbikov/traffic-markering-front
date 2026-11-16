import { VIEW_REGION_LABELS } from './dictionaries';

export const VIEW_REGIONS = ['CIS', 'WORLD'];

export const DEFAULT_VIEW_REGION = 'WORLD';

const REGION_VIEWS = {
  CIS: 'просмотры из России и стран СНГ',
  WORLD: 'все просмотры, откуда бы они ни были',
};

export const viewRegionLabel = (region) => VIEW_REGION_LABELS[region] || region || '';

export const isWorldRegion = (region) => !region || region === 'WORLD';

export const describeViewRegion = (region) =>
  REGION_VIEWS[region] || REGION_VIEWS[DEFAULT_VIEW_REGION];

export const viewRegionHint = (region) =>
  isWorldRegion(region)
    ? `оплачиваются ${describeViewRegion(region)}`
    : `оплачиваются только ${describeViewRegion(region)}`;
