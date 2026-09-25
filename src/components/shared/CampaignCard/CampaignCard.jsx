import React from 'react';
import { Link } from 'react-router-dom';
import SocialIcon from '../SocialIcon/SocialIcon';
import Skeleton from '../Skeleton/Skeleton';
import { formatRubles } from '../../../shared/money';
import { PLATFORM_LABELS } from '../../../shared/dictionaries';
import { formatDay, periodState } from '../../../shared/dates';
import { DEFAULT_VIEW_REGION, isWorldRegion, viewRegionLabel } from '../../../shared/viewRegion';
import styles from './CampaignCard.module.css';

const TEETH = 'M0 0L10 8L0 16Z';

export const budgetProgress = (campaign) => {
  const budget = Math.max(0, Number(campaign?.budgetKopecks) || 0);
  const spent = Math.min(budget, Math.max(0, Number(campaign?.spentKopecks) || 0));
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  return { budget, spent, percent, exhausted: budget > 0 && spent >= budget };
};

export const campaignAvailability = (campaign) => {
  if (!campaign) return { open: false, label: '' };
  if (campaign.status && campaign.status !== 'ACTIVE') {
    return { open: false, label: 'Приём работ закрыт' };
  }
  const period = periodState(campaign.startsAt, campaign.endsAt);
  if (period === 'upcoming') {
    return { open: false, label: `Приём откроется ${formatDay(campaign.startsAt)}` };
  }
  if (period === 'ended') return { open: false, label: 'Приём работ завершён' };
  if (budgetProgress(campaign).exhausted) return { open: false, label: 'Бюджет исчерпан' };
  return {
    open: true,
    label: campaign.endsAt ? `Приём открыт до ${formatDay(campaign.endsAt)}` : 'Приём работ открыт',
  };
};

const TicketStub = ({ patternId }) => (
  <div className={styles.stub} aria-hidden="true">
    <svg className={styles.teeth} width="10" height="100%">
      <defs>
        <pattern id={patternId} width="10" height="16" patternUnits="userSpaceOnUse">
          <path d={TEETH} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="10" height="100%" fill={`url(#${patternId})`} />
    </svg>
  </div>
);

const CampaignCard = ({ campaign, to, index }) => {
  if (!campaign) return null;

  const customer = campaign.customerCompany || campaign.customerName || 'Заказчик';
  const target = to || `/campaigns/${campaign.publicId}`;
  const platforms = Array.isArray(campaign.platforms) ? campaign.platforms : [];
  const region = campaign.viewRegion || DEFAULT_VIEW_REGION;
  const { budget, spent, percent } = budgetProgress(campaign);
  const availability = campaignAvailability(campaign);

  return (
    <Link to={target} className={styles.card}>
      <div className={styles.body}>
        <p className={styles.kicker}>
          {index != null && (
            <span className={styles.num}>Оффер {String(index + 1).padStart(2, '0')}</span>
          )}
          <span className={styles.customer}>{customer}</span>
        </p>
        <h2 className={styles.title}>{campaign.title}</h2>

        <ul className={styles.chips}>
          {platforms.map((platform) => (
            <li key={platform} className={styles.chip}>
              <SocialIcon name={platform} className={styles.chipIcon} />
              {PLATFORM_LABELS[platform] || platform}
            </li>
          ))}
          {!isWorldRegion(region) && <li className={styles.chip}>{viewRegionLabel(region)}</li>}
        </ul>

        <p className={styles.rate}>
          <span className={styles.rateValue}>{formatRubles(campaign.ratePerThousandKopecks)}</span>
          <span className={styles.rateUnit}>за 1 000 просмотров</span>
        </p>

        <div className={styles.budget}>
          <span className={styles.budgetText}>
            {formatRubles(spent)} из {formatRubles(budget)} выплачено
          </span>
          <span className={styles.budgetPercent}>{percent}%</span>
        </div>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>

        <p className={styles.footer}>
          <span className={availability.open ? styles.open : styles.closed}>
            {availability.label}
          </span>
          <span className={styles.more}>Открыть →</span>
        </p>
      </div>

      <TicketStub patternId={`teeth-${campaign.publicId || campaign.id}`} />
    </Link>
  );
};

export const CampaignCardSkeleton = ({ index }) => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.body}>
      <p className={styles.kicker}>
        <Skeleton width="16ch" />
      </p>
      <h2 className={styles.title}>
        <Skeleton width="80%" />
      </h2>
      <div className={styles.chips}>
        <Skeleton width="6.5rem" height={28} radius="999px" />
        <Skeleton width="5.5rem" height={28} radius="999px" />
      </div>
      <p className={styles.rate}>
        <span className={styles.rateValue}>
          <Skeleton width="5ch" />
        </span>
        <Skeleton width="9rem" />
      </p>
      <div className={styles.budget}>
        <Skeleton width="14rem" />
        <Skeleton width="3ch" />
      </div>
      <Skeleton block height={5} radius={3} />
      <p className={styles.footer}>
        <Skeleton width="12rem" />
      </p>
    </div>
    <TicketStub patternId={`teeth-skeleton-${index}`} />
  </div>
);

export default CampaignCard;
