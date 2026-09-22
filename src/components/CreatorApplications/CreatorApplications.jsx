import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { formatRubles, formatViews } from '../../shared/money';
import {
  APPLICATION_STATUS_LABELS,
  PLATFORM_LABELS,
  formatDate,
} from '../../shared/dictionaries';
import { DEFAULT_VIEW_REGION, isWorldRegion, viewRegionLabel } from '../../shared/viewRegion';
import { FraudBadge } from '../shared/FraudBadge/FraudBadge';
import styles from './CreatorApplications.module.css';

const STATUS_CLASS = {
  PENDING: styles.statusPending,
  APPROVED: styles.statusApproved,
  REJECTED: styles.statusRejected,
  COMPLETED: styles.statusCompleted,
};

// Взятыми в работу считаем и одобренные, и уже завершённые отклики —
// по ним криатору начисляются деньги.
const isApproved = (application) =>
  application.status === 'APPROVED' || application.status === 'COMPLETED';

const renderPayableViews = (application) => {
  if (isWorldRegion(application.campaignViewRegion)) return null;
  if (application.viewsGeographyKnown === false) {
    return (
      <span className={styles.numbersWarn}>география недоступна — просмотры не оплачиваются</span>
    );
  }
  return (
    <span>
      в расчёт: <b>{formatViews(application.payableViews ?? 0)}</b>
    </span>
  );
};

const CreatorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      const res = await apiClient.api.myApplications();
      setApplications(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить отклики'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } finally {
      setRefreshing(false);
    }
  };

  const handleWithdraw = async (application) => {
    if (!window.confirm(`Отозвать отклик на «${application.campaignTitle}»?`)) return;
    setBusyId(application.id);
    try {
      await apiClient.api.deleteApplication(application.id);
      toast.success('Отклик отозван');
      await loadApplications();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось отозвать отклик'
      );
    } finally {
      setBusyId(null);
    }
  };

  const approvedCount = applications.filter(isApproved).length;
  const earnedKopecks = applications.reduce(
    (sum, application) => sum + (application.accruedKopecks || 0),
    0
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Мои отклики</h1>
        <Link to="/app/earnings" className={styles.earningsLink}>
          заработок и вывод →
        </Link>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
          title="Обновить список откликов"
          aria-label="Обновить список откликов"
        >
          <svg
            className={refreshing ? styles.spinning : undefined}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.9 8a5.9 5.9 0 1 1-1.73-4.17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M13.9 1.6v2.8h-2.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>всего откликов</span>
          <span className={styles.summaryValue}>{applications.length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>одобрено</span>
          <span className={styles.summaryValue}>{approvedCount}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>заработано</span>
          <span className={`${styles.summaryValue} ${styles.summaryMoney}`}>
            {formatRubles(earnedKopecks)}
          </span>
        </div>
      </div>

      {pageError && <p className={styles.banner}>{pageError}</p>}

      {loading ? (
        <p className={styles.message}>Загрузка откликов…</p>
      ) : applications.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Откликов пока нет</p>
          <p className={styles.emptyText}>
            Выберите объявление на доске, снимите ролик и приложите на него ссылку —
            деньги начисляются по мере набора просмотров.
          </p>
          <Link to="/app/board" className={styles.primaryBtn}>
            К доске объявлений
          </Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {applications.map((application) => (
            <li key={application.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.itemTitle}>{application.campaignTitle}</span>
                <span className={styles.itemBadges}>
                  <FraudBadge status={application.fraudStatus} />
                  <span className={`${styles.status} ${STATUS_CLASS[application.status] || ''}`}>
                    {application.statusDescription ||
                      APPLICATION_STATUS_LABELS[application.status] ||
                      application.status}
                  </span>
                </span>
              </div>

              <p className={styles.rate}>
                {formatRubles(application.ratePerThousandKopecks)}
                <span className={styles.rateUnit}> / 1000 просмотров</span>
              </p>

              <p className={styles.meta}>
                {application.platformDescription ||
                  PLATFORM_LABELS[application.platform] ||
                  application.platform}
                {' · '}
                отклик от {formatDate(application.createdAt)}
                {' · '}
                вывод от {formatRubles(application.minPayoutKopecks)}
                {' · '}
                просмотры: {viewRegionLabel(application.campaignViewRegion || DEFAULT_VIEW_REGION)}
              </p>

              <a
                className={styles.videoLink}
                href={application.videoUrl}
                target="_blank"
                rel="noreferrer"
              >
                {application.videoUrl}
              </a>

              <div className={styles.numbers}>
                <span>
                  просмотров: <b>{formatViews(application.views ?? 0)}</b>
                </span>
                {renderPayableViews(application)}
                <span className={styles.earned}>
                  заработано: <b>{formatRubles(application.accruedKopecks ?? 0)}</b>
                </span>
                {application.creditedKopecks != null && (
                  <span>
                    в кошельке: <b>{formatRubles(application.creditedKopecks)}</b>
                  </span>
                )}
              </div>

              {(application.fraudStatus === 'SUSPICIOUS' || application.fraudStatus === 'FRAUD') && (
                <p className={styles.numbersWarn}>
                  {application.fraudStatus === 'FRAUD'
                    ? 'Платформа признала просмотры накрученными: начисление обнулено. Если это ошибка, напишите в поддержку.'
                    : 'Просмотры на проверке: платформа заметила признаки накрутки, деньги заморожены до решения.'}
                </p>
              )}

              {application.status === 'PENDING' && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleWithdraw(application)}
                    disabled={busyId === application.id}
                  >
                    Отозвать
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreatorApplications;
