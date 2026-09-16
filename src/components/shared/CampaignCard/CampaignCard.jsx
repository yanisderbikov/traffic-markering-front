import React from 'react';
import { Link } from 'react-router-dom';
import BudgetBar from '../BudgetBar/BudgetBar';
import { formatRubles } from '../../../shared/money';
import { formatDate } from '../../../shared/dictionaries';
import styles from './CampaignCard.module.css';

// «3 отклика» / «5 откликов» — без склонения число рядом со словом читается как ошибка.
const applicationsLabel = (count) => {
  const n = Math.abs(Number(count) || 0);
  const tail = n % 100;
  const last = n % 10;
  if (tail > 10 && tail < 20) return `${n} откликов`;
  if (last === 1) return `${n} отклик`;
  if (last >= 2 && last <= 4) return `${n} отклика`;
  return `${n} откликов`;
};

/**
 * Карточка объявления с публичной доски (CampaignBoardDTO).
 * Клик ведёт на страницу объявления; `to` можно переопределить,
 * чтобы из кабинета вести на редактор той же карточкой.
 */
const CampaignCard = ({ campaign, to }) => {
  if (!campaign) return null;

  const customer = campaign.customerCompany || campaign.customerName || 'заказчик';
  const target = to || `/campaigns/${campaign.publicId}`;

  return (
    <Link to={target} className={styles.card}>
      <div className={styles.media}>
        {campaign.photoUrl ? (
          <>
            <img
              className={styles.mediaBackdrop}
              src={campaign.photoUrl}
              alt=""
              aria-hidden="true"
            />
            <img className={styles.mediaPhoto} src={campaign.photoUrl} alt={campaign.title} />
          </>
        ) : (
          <span className={styles.mediaEmpty}>без фото</span>
        )}
      </div>

      <h2 className={styles.title}>{campaign.title}</h2>

      <p className={styles.rate}>
        {formatRubles(campaign.ratePerThousandKopecks)}
        <span className={styles.rateUnit}> / 1000 просмотров</span>
      </p>

      {campaign.regionDescription && (
        <span className={styles.region}>{campaign.regionDescription}</span>
      )}

      <BudgetBar
        budgetKopecks={campaign.budgetKopecks}
        spentKopecks={campaign.spentKopecks}
        compact
      />

      <div className={styles.footer}>
        <span className={styles.customer}>{customer}</span>
        <span className={styles.meta}>
          {applicationsLabel(campaign.applicationsCount)}
          {campaign.createdAt ? ` · ${formatDate(campaign.createdAt)}` : ''}
        </span>
      </div>
    </Link>
  );
};

export default CampaignCard;
