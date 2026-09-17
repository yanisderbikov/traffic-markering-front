import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import { formatRubles } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, formatDate } from '../../shared/dictionaries';
import styles from './CustomerCampaigns.module.css';

// Цвет бейджа зависит от статуса: активное объявление должно бросаться в глаза.
const STATUS_CLASS = {
  DRAFT: styles.statusDraft,
  ACTIVE: styles.statusActive,
  PAUSED: styles.statusPaused,
  COMPLETED: styles.statusCompleted,
};

const CustomerCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await apiClient.api.myCampaigns();
      setCampaigns(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить объявления'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Мои объявления</h1>
        <div className={styles.headActions}>
          <Link to="/app/campaigns/new" className={styles.primaryBtn}>
            Новое объявление
          </Link>
        </div>
      </div>

      {pageError && <p className={styles.banner}>{pageError}</p>}

      {loading ? (
        <p className={styles.message}>Загрузка объявлений…</p>
      ) : campaigns.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Объявлений пока нет</p>
          <p className={styles.emptyText}>
            Создайте первое: опишите задачу, укажите ставку за 1000 просмотров и бюджет —
            криаторы увидят его на доске.
          </p>
          <Link to="/app/campaigns/new" className={styles.primaryBtn}>
            Новое объявление
          </Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {campaigns.map((campaign) => (
            <li key={campaign.id} className={styles.item}>
              <Link to={`/app/campaigns/${campaign.id}`} className={styles.itemLink}>
                <div className={styles.media}>
                  {campaign.photoUrl ? (
                    <>
                      <img
                        className={styles.mediaBackdrop}
                        src={campaign.photoUrl}
                        alt=""
                        aria-hidden="true"
                      />
                      <img
                        className={styles.mediaPhoto}
                        src={campaign.photoUrl}
                        alt={campaign.title}
                      />
                    </>
                  ) : (
                    <span className={styles.mediaEmpty}>без фото</span>
                  )}
                </div>
                <div className={styles.itemHead}>
                  <span className={styles.itemTitle}>{campaign.title}</span>
                  <span className={`${styles.status} ${STATUS_CLASS[campaign.status] || ''}`}>
                    {campaign.statusDescription ||
                      CAMPAIGN_STATUS_LABELS[campaign.status] ||
                      campaign.status}
                  </span>
                </div>

                <p className={styles.rate}>
                  {formatRubles(campaign.ratePerThousandKopecks)}
                  <span className={styles.rateUnit}> / 1000 просмотров</span>
                </p>

                <BudgetBar
                  budgetKopecks={campaign.budgetKopecks}
                  spentKopecks={campaign.spentKopecks}
                  compact
                />

                <p className={styles.meta}>
                  регион: {campaign.regionDescription || campaign.region || '—'}
                  {' · '}
                  откликов: {campaign.applicationsCount ?? 0}
                  {' · '}
                  создано {formatDate(campaign.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerCampaigns;
