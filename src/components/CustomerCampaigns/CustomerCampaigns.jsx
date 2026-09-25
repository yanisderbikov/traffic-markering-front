import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import PlatformList from '../shared/PlatformList/PlatformList';
import Skeleton from '../shared/Skeleton/Skeleton';
import { formatRubles, formatViews } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, formatDate } from '../../shared/dictionaries';
import { DEFAULT_VIEW_REGION, viewRegionLabel } from '../../shared/viewRegion';
import { formFromCampaign, missingLabels } from '../CampaignEditor/campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CustomerCampaigns.module.css';

const STATUS_CHIP = {
  ACTIVE: ui.chipSuccess,
  PAUSED: ui.chipWarning,
  DRAFT: ui.chipOutline,
  COMPLETED: ui.chipOutline,
};

const FILTERS = [
  { id: 'ALL', label: 'Все' },
  { id: 'ACTIVE', label: 'Активные' },
  { id: 'PAUSED', label: 'На паузе' },
  { id: 'DRAFT', label: 'Черновики' },
  { id: 'COMPLETED', label: 'Завершённые' },
];

const SKELETON_ROWS = 3;

const CampaignRowSkeleton = () => (
  <li aria-hidden="true">
    <div className={`${ui.card} ${styles.row}`}>
      <div className={styles.media}>
        <Skeleton block height="100%" radius={0} />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            <Skeleton width="16ch" />
          </h2>
          <Skeleton width="6rem" height={30} radius="999px" />
        </div>
        <div className={styles.rateRow}>
          <span className={styles.rate}>
            <Skeleton width="12rem" />
          </span>
          <Skeleton width="6rem" />
        </div>
        <Skeleton block height={6} radius={3} />
        <p className={styles.meta}>
          <Skeleton width="min(26rem, 90%)" />
        </p>
      </div>
    </div>
  </li>
);

const DraftProgress = ({ campaign }) => {
  const missing = missingLabels(formFromCampaign(campaign));
  return missing.length ? (
    <p className={ui.hintWarn}>Осталось заполнить: {missing.join(', ')}</p>
  ) : (
    <p className={ui.hintOk}>Всё заполнено — осталось запустить</p>
  );
};

const CustomerCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await apiClient.api.myCampaigns();
      setCampaigns(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить кампании'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const countOf = (id) =>
    id === 'ALL' ? campaigns.length : campaigns.filter((row) => row.status === id).length;
  const shown = filter === 'ALL' ? campaigns : campaigns.filter((row) => row.status === filter);

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>Мои кампании</h1>
          <p className={ui.subtitle}>
            Все кампании, их бюджеты и отклики креаторов. Нажмите на кампанию, чтобы открыть
            детали.
          </p>
        </div>
        <div className={`${ui.pageHeadActions} ${styles.headActions}`}>
          <Link to="/app/campaigns/new" className={ui.btnPrimary}>
            + Создать кампанию
          </Link>
        </div>
      </header>

      {pageError && <p className={ui.errorBanner}>{pageError}</p>}

      <div className={`${ui.chips} ${styles.filters}`} role="tablist" aria-label="Фильтр по статусу">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? ui.chipActive : ui.chip}
            onClick={() => setFilter(item.id)}
          >
            {item.label} {loading ? <Skeleton width="1ch" /> : countOf(item.id)}
          </button>
        ))}
      </div>

      {loading ? (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <CampaignRowSkeleton key={index} />
          ))}
        </ul>
      ) : campaigns.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>Кампаний пока нет</p>
          <p className={ui.emptyText}>
            Создайте первую: опишите задачу, укажите ставку за 1 000 просмотров и бюджет.
            Креаторы увидят её в офферах.
          </p>
          <Link to="/app/campaigns/new" className={ui.btnPrimary}>
            Создать кампанию
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>В этом статусе кампаний нет</p>
          <p className={ui.emptyText}>Выберите другой фильтр или создайте новую кампанию.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {shown.map((campaign) => (
            <li key={campaign.id}>
              <Link to={`/app/campaigns/${campaign.id}`} className={`${ui.card} ${styles.row}`}>
                <div className={styles.media}>
                  {campaign.photoUrl ? (
                    <img src={campaign.photoUrl} alt="" />
                  ) : (
                    <span className={styles.mediaEmpty}>
                      {(campaign.title || '·').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className={styles.body}>
                  <div className={styles.head}>
                    <h2 className={styles.title}>{campaign.title || 'Новая кампания'}</h2>
                    <div className={ui.chips}>
                      <span className={STATUS_CHIP[campaign.status] || ui.chipOutline}>
                        {campaign.statusDescription ||
                          CAMPAIGN_STATUS_LABELS[campaign.status] ||
                          campaign.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.rateRow}>
                    <span className={styles.rate}>
                      {formatRubles(campaign.ratePerThousandKopecks)}
                      <span className={styles.rateUnit}> / 1 000 просмотров</span>
                    </span>
                    <PlatformList platforms={campaign.platforms} compact />
                  </div>

                  {campaign.status === 'DRAFT' ? (
                    <DraftProgress campaign={campaign} />
                  ) : (
                    <BudgetBar
                      budgetKopecks={campaign.budgetKopecks}
                      spentKopecks={campaign.spentKopecks}
                      compact
                    />
                  )}

                  <p className={styles.meta}>
                    <span>Откликов: {campaign.applicationsCount ?? 0}</span>
                    <span>Просмотров: {formatViews(campaign.totalViews ?? 0)}</span>
                    <span>{viewRegionLabel(campaign.viewRegion || DEFAULT_VIEW_REGION)}</span>
                    <span>Создано {formatDate(campaign.createdAt)}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerCampaigns;
