import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import CampaignCard, {
  CampaignCardSkeleton,
  campaignAvailability,
} from '../shared/CampaignCard/CampaignCard';
import Skeleton from '../shared/Skeleton/Skeleton';
import PublicLayout from '../shared/PublicLayout/PublicLayout';
import Icon from '../shared/Icon/Icon';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { VIDEO_PLATFORMS } from '../../shared/video';
import { pluralize } from '../../shared/requirements';
import FitRubles from '../shared/FitRubles/FitRubles';
import ui from '../../shared/ui.module.css';
import styles from './Board.module.css';

const SKELETON_CARDS = 4;

const SORTS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'rate', label: 'Выше ставка' },
  { value: 'budget', label: 'Больше остаток' },
];

const SCOPES = [
  { id: 'new', label: 'Новые офферы' },
  { id: 'applied', label: 'Вы откликнулись' },
];

const latestApplicationByCampaign = (applications) => {
  const byCampaign = new Map();
  applications.forEach((application) => {
    if (application.campaignPublicId && !byCampaign.has(application.campaignPublicId)) {
      byCampaign.set(application.campaignPublicId, application);
    }
  });
  return byCampaign;
};

const createdTime = (campaign) => {
  const value = campaign.createdAt;
  if (!value) return 0;
  return typeof value === 'number' ? value * 1000 : new Date(value).getTime() || 0;
};

const remaining = (campaign) =>
  campaign.remainingKopecks ??
  Math.max(0, (Number(campaign.budgetKopecks) || 0) - (Number(campaign.spentKopecks) || 0));

const sortCampaigns = (rows, sort) => {
  const list = [...rows];
  if (sort === 'rate') {
    list.sort((a, b) => (b.ratePerThousandKopecks || 0) - (a.ratePerThousandKopecks || 0));
  } else if (sort === 'budget') {
    list.sort((a, b) => remaining(b) - remaining(a));
  } else {
    list.sort((a, b) => createdTime(b) - createdTime(a));
  }
  return list;
};

const Board = ({ embedded = false }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('new');
  const [applications, setApplications] = useState([]);
  const [scope, setScope] = useState('new');

  const isCreator = embedded && apiClient.getJwtMetadata()?.role === 'CREATOR';

  const loadCampaigns = useCallback(async () => {
    try {
      const [res, mine] = await Promise.all([
        apiClient.api.boardCampaigns(),
        isCreator ? apiClient.api.myApplications().catch(() => null) : null,
      ]);
      setCampaigns(Array.isArray(res.data) ? res.data : []);
      if (mine) setApplications(Array.isArray(mine.data) ? mine.data : []);
      setError('');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить офферы'
      );
    } finally {
      setLoading(false);
    }
  }, [isCreator]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCampaigns();
    } finally {
      setRefreshing(false);
    }
  };

  const applied = useMemo(() => latestApplicationByCampaign(applications), [applications]);

  const scoped = useMemo(
    () =>
      isCreator
        ? campaigns.filter((row) => applied.has(row.publicId) === (scope === 'applied'))
        : campaigns,
    [campaigns, applied, isCreator, scope]
  );

  const visible = useMemo(() => {
    const filtered = platform
      ? scoped.filter((row) => Array.isArray(row.platforms) && row.platforms.includes(platform))
      : scoped;
    return sortCampaigns(filtered, sort);
  }, [scoped, platform, sort]);

  const appliedCount = campaigns.filter((row) => applied.has(row.publicId)).length;
  const scopeCounts = { new: campaigns.length - appliedCount, applied: appliedCount };

  const emptyState = () => {
    if (campaigns.length === 0) {
      return {
        title: 'Активных офферов пока нет',
        text: 'Загляните позже: новые кампании появляются здесь сразу после запуска.',
      };
    }
    if (scoped.length === 0 && scope === 'applied') {
      return {
        title: 'Вы ещё не откликались',
        text: 'Возьмите оффер в работу — он появится здесь, а этапы по нему будут в «Моих работах».',
      };
    }
    if (scoped.length === 0) {
      return {
        title: 'Новых офферов нет',
        text: 'Вы уже откликнулись на все активные офферы. Загляните позже.',
      };
    }
    return {
      title: 'Под фильтр ничего не подошло',
      text: 'Попробуйте другую площадку или снимите фильтр.',
    };
  };
  const empty = emptyState();

  const openCount = campaigns.filter((row) => campaignAvailability(row).open).length;
  const totalRemaining = campaigns.reduce((sum, row) => sum + remaining(row), 0);

  const body = (
    <>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          {embedded && <span className={ui.eyebrow}>Креатор</span>}
          <h1 className={ui.title}>Найди свой следующий оффер</h1>
          <p className={ui.subtitle}>Создавай контент для брендов, которые тебе близки.</p>
        </div>
        {embedded && (
          <div className={ui.pageHeadActions}>
            <button
              type="button"
              className={ui.btnSecondary}
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Обновить офферы"
            >
              <Icon name="refresh" size={18} className={refreshing ? styles.spinning : ''} />
              Обновить
            </button>
          </div>
        )}
      </header>

      <div className={styles.stats}>
        <div className={styles.statBudget}>
          <span className={styles.statLabel}>Общий остаток бюджета</span>
          {loading ? (
            <span className={styles.statValue}>
              <Skeleton width="7ch" />
            </span>
          ) : (
            <FitRubles className={styles.statValue} kopecks={totalRemaining} />
          )}
        </div>
        <div className={styles.statCount}>
          <span className={styles.statCountValue}>
            {loading ? <Skeleton width="2ch" /> : openCount}
          </span>
          <span className={styles.statCountLabel}>
            <span>активных</span>
            <span>{pluralize(openCount, ['оффер', 'оффера', 'офферов'])}</span>
          </span>
        </div>
      </div>

      {isCreator && (
        <div className={styles.scopes} role="tablist" aria-label="Офферы">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={scope === item.id}
              className={scope === item.id ? styles.scopeActive : styles.scope}
              onClick={() => setScope(item.id)}
            >
              {item.label}
              <span className={styles.scopeCount}>
                {loading ? <Skeleton width="1ch" /> : scopeCounts[item.id]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={ui.chips} role="group" aria-label="Площадка">
          <button
            type="button"
            className={platform ? ui.chip : ui.chipActive}
            onClick={() => setPlatform('')}
          >
            Все офферы
          </button>
          {VIDEO_PLATFORMS.map((item) => (
            <button
              key={item}
              type="button"
              className={platform === item ? ui.chipActive : ui.chip}
              onClick={() => setPlatform(platform === item ? '' : item)}
            >
              {PLATFORM_LABELS[item]}
            </button>
          ))}
        </div>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>Сортировка</span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className={ui.errorBanner}>{error}</p>}

      {loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <CampaignCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>{empty.title}</p>
          <p className={ui.emptyText}>{empty.text}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((campaign, index) => (
            <CampaignCard
              key={campaign.id || campaign.publicId}
              campaign={campaign}
              application={applied.get(campaign.publicId)}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className={ui.page}>{body}</div>;
  }

  return (
    <PublicLayout>
      <div className={styles.publicWrap}>{body}</div>
    </PublicLayout>
  );
};

export default Board;
