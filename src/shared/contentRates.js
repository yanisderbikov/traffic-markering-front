import { formatRubles } from './money';
import { campaignRates, fullRate, isSnapshot } from './placement';

// Ставки по тематикам роликов: заказчик называет тематики сам, креатор при подаче выбирает свою
export const contentRatesOf = (campaign) =>
  Array.isArray(campaign?.contentRates) ? campaign.contentRates : [];

export const hasContentRates = (campaign) => contentRatesOf(campaign).length > 0;

const rateOf = (rate) => rate?.ratePerThousandKopecks ?? 0;

// Диапазон для витрины: от самой дешёвой тематики до самой дорогой с надбавками «ссылки и промокода»
export const campaignRateBounds = (campaign) => {
  const rates = contentRatesOf(campaign).map(rateOf);
  const base = campaign?.ratePerThousandKopecks ?? 0;
  const top = isSnapshot(campaign) ? fullRate(campaignRates(campaign)) : base;
  return { min: rates.length ? Math.min(...rates) : base, max: top };
};

export const campaignRateLabel = (campaign) => {
  const { min, max } = campaignRateBounds(campaign);
  return min < max ? `${formatRubles(min)} – ${formatRubles(max)}` : formatRubles(max);
};
