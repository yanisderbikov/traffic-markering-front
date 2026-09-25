import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import CreatorSocials from '../shared/CreatorSocials/CreatorSocials';
import Icon from '../shared/Icon/Icon';
import { FraudBadge, FraudFlags, TrustBadge } from '../shared/FraudBadge/FraudBadge';
import { errorMessage } from '../../shared/auth';
import { DEFAULT_VIEW_REGION, viewRegionLabel } from '../../shared/viewRegion';
import { formatRubles, formatViews } from '../../shared/money';
import { formatDay } from '../../shared/dates';
import { pluralize } from '../../shared/requirements';
import {
  APPLICATION_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PLATFORM_LABELS,
  formatDate,
} from '../../shared/dictionaries';
import { formatCompactViews } from './campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

const APPLICATION_ACTIONS = [
  { status: 'APPROVED', label: 'Одобрить' },
  { status: 'REJECTED', label: 'Отклонить' },
  { status: 'COMPLETED', label: 'Завершить' },
];

const APPLICATION_CHIP = {
  PENDING: ui.chipWarning,
  APPROVED: ui.chipSuccess,
  REJECTED: ui.chipDanger,
  COMPLETED: ui.chipOutline,
};

export const CAMPAIGN_CHIP = {
  ACTIVE: ui.chipSuccess,
  PAUSED: ui.chipWarning,
  DRAFT: ui.chipOutline,
  COMPLETED: ui.chipOutline,
};

export const campaignStatusLabel = (campaign) =>
  campaign.statusDescription || CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status;

const isPublished = (application) =>
  application.status === 'APPROVED' || application.status === 'COMPLETED';

const actionClass = (status) =>
  status === 'REJECTED' ? ui.btnDanger : status === 'APPROVED' ? ui.btnPrimary : ui.btnSecondary;

const CampaignOverview = ({ campaign, onReload }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState('');
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      const res = await apiClient.api.campaignApplications(campaign.id);
      setApplications(Array.isArray(res.data) ? res.data : []);
      setApplicationsError('');
    } catch (err) {
      setApplicationsError(errorMessage(err, 'Не удалось загрузить отклики'));
    } finally {
      setApplicationsLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDelete = async () => {
    if (!window.confirm(`Удалить кампанию «${campaign.title || 'Без названия'}»?`)) return;
    setDeleting(true);
    try {
      await apiClient.api.deleteCampaign(campaign.id);
      toast.success('Кампания удалена');
      navigate('/app/campaigns', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось удалить кампанию'));
      setDeleting(false);
    }
  };

  const handleApplicationStatus = async (application, status) => {
    setBusyApplicationId(application.id);
    try {
      await apiClient.api.updateApplicationStatus(application.id, { status });
      toast.success(`Отклик: ${APPLICATION_STATUS_LABELS[status] || status}`);
      await Promise.all([loadApplications(), onReload()]);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сменить статус отклика'));
    } finally {
      setBusyApplicationId(null);
    }
  };

  const budgetKopecks = campaign.budgetKopecks ?? 0;
  const spentKopecks = campaign.spentKopecks ?? 0;
  const totalViews = campaign.totalViews ?? 0;
  const published = applications.filter(isPublished);
  const creators = new Set(published.map((row) => row.creatorId)).size;
  const cpv = totalViews > 0 ? spentKopecks / totalViews : 0;
  const budgetPercent =
    budgetKopecks > 0 ? Math.min(100, Math.round((spentKopecks / budgetKopecks) * 100)) : 0;
  const funnel = [
    { label: 'Отклики', value: applications.length },
    { label: 'Одобрено', value: published.length },
    { label: 'Набрали просмотры', value: published.filter((row) => (row.views ?? 0) > 0).length },
    { label: 'Завершено', value: applications.filter((row) => row.status === 'COMPLETED').length },
  ];
  const funnelMax = applications.length || 1;

  return (
    <div className={ui.page}>
      <Link to="/app/campaigns" className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> Мои кампании
      </Link>

      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>{campaign.title || 'Без названия'}</h1>
          <p className={styles.crumbs}>
            <span className={CAMPAIGN_CHIP[campaign.status] || ui.chipOutline}>
              {campaignStatusLabel(campaign)}
            </span>
            <span>создана {formatDate(campaign.createdAt)}</span>
            {campaign.publicId && campaign.status === 'ACTIVE' && (
              <Link to={`/campaigns/${campaign.publicId}`} className={ui.linkAccent}>
                Как видят креаторы →
              </Link>
            )}
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <button type="button" className={ui.btnDanger} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
          <Link to={`/app/campaigns/${campaign.id}/edit`} className={ui.btnPrimary}>
            Изменить объявление
          </Link>
        </div>
      </header>

      <div className={ui.grid4}>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Подтверждённые просмотры</span>
          <span className={ui.statValue}>{formatCompactViews(totalViews)}</span>
          <span className={ui.statNote}>{formatViews(totalViews)} всего</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Потрачено</span>
          <span className={ui.statValue}>{formatRubles(spentKopecks)}</span>
          <span className={ui.statNote}>{budgetPercent}% бюджета</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Роликов в работе</span>
          <span className={ui.statValue}>{applicationsLoading ? '…' : published.length}</span>
          <span className={`${ui.statNote} ${creators ? ui.statUp : ''}`}>
            {applicationsLoading
              ? ''
              : `${creators} ${pluralize(creators, ['креатор', 'креатора', 'креаторов'])}`}
          </span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Средняя цена просмотра</span>
          <span className={ui.statValue}>{cpv > 0 ? formatRubles(Math.round(cpv)) : '—'}</span>
          <span className={ui.statNote}>
            ставка {formatRubles(campaign.ratePerThousandKopecks)} / 1 000
          </span>
        </div>
      </div>

      <div className={styles.analytics}>
        <section className={ui.card}>
          <h2 className={ui.cardTitle}>Бюджет кампании</h2>
          <p className={styles.bigMoney}>{formatRubles(campaign.remainingKopecks ?? 0)}</p>
          <p className={styles.bigMoneyNote}>Осталось на просмотры</p>
          <BudgetBar budgetKopecks={campaign.budgetKopecks} spentKopecks={campaign.spentKopecks} />
          <p className={styles.bigMoneyNote}>
            Регион просмотров: {viewRegionLabel(campaign.viewRegion || DEFAULT_VIEW_REGION)}
            {campaign.endsAt ? ` · приём до ${formatDay(campaign.endsAt)}` : ''}
          </p>
        </section>
        <section className={ui.card}>
          <h2 className={ui.cardTitle}>Воронка кампании</h2>
          <ul className={styles.funnel}>
            {funnel.map((row) => (
              <li key={row.label} className={styles.funnelRow}>
                <div className={styles.funnelHead}>
                  <span className={styles.funnelLabel}>{row.label}</span>
                  <span className={styles.funnelValue}>{applicationsLoading ? '…' : row.value}</span>
                  <span className={styles.funnelPercent}>
                    {applicationsLoading ? '' : `${Math.round((row.value / funnelMax) * 100)}%`}
                  </span>
                </div>
                <div className={ui.track} aria-hidden="true">
                  <div
                    className={ui.fill}
                    style={{ width: `${applicationsLoading ? 0 : (row.value / funnelMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>Отклики креаторов</h2>
        <button
          type="button"
          className={`${ui.btnSecondary} ${ui.btnSmall}`}
          onClick={loadApplications}
          disabled={applicationsLoading}
        >
          <Icon name="refresh" size={16} /> Обновить
        </button>
      </div>
      <section className={`${ui.card} ${styles.applications}`}>
        {applicationsError && <p className={ui.errorBanner}>{applicationsError}</p>}
        {applicationsLoading ? (
          <p className={ui.message}>Загрузка откликов…</p>
        ) : applications.length === 0 ? (
          <p className={ui.message}>Откликов пока нет. Активная кампания видна креаторам в офферах.</p>
        ) : (
          <ul className={styles.appList}>
            {applications.map((application) => {
              const open = expandedId === application.id;
              return (
                <li key={application.id} className={styles.appItem}>
                  <button
                    type="button"
                    className={`${styles.appRow} ${open ? styles.appRowOpen : ''}`}
                    onClick={() => setExpandedId(open ? null : application.id)}
                    aria-expanded={open}
                  >
                    <span className={styles.appCreator}>
                      <span className={ui.avatar} aria-hidden="true">
                        {(application.creatorName || '·').trim().charAt(0)}
                      </span>
                      <span className={styles.appCreatorText}>
                        <span className={styles.appName}>
                          {application.creatorName} <TrustBadge level={application.creatorTrustLevel} />
                        </span>
                        <span className={styles.appMeta}>
                          {application.platformDescription ||
                            PLATFORM_LABELS[application.platform] ||
                            application.platform}
                          {' · '}
                          {formatDate(application.createdAt)}
                        </span>
                      </span>
                    </span>
                    <span className={styles.appCell}>
                      <span className={styles.appCellLabel}>Просмотры</span>
                      <span className={styles.appCellValue}>{formatViews(application.views ?? 0)}</span>
                    </span>
                    <span className={styles.appCell}>
                      <span className={styles.appCellLabel}>Начислено</span>
                      <span className={`${styles.appCellValue} ${ui.money}`}>
                        {formatRubles(application.accruedKopecks ?? 0)}
                      </span>
                    </span>
                    <span className={styles.appStatus}>
                      <FraudBadge status={application.fraudStatus} />
                      <span className={APPLICATION_CHIP[application.status] || ui.chipOutline}>
                        {application.statusDescription ||
                          APPLICATION_STATUS_LABELS[application.status] ||
                          application.status}
                      </span>
                    </span>
                  </button>

                  {open && (
                    <div className={styles.appDetails}>
                      <a
                        className={styles.videoLink}
                        href={application.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon name="external" size={16} /> {application.videoUrl}
                      </a>
                      {application.creatorTelegram && (
                        <p className={styles.appMeta}>Telegram: {application.creatorTelegram}</p>
                      )}
                      {application.comment && <p className={styles.comment}>{application.comment}</p>}
                      {application.campaignViewRegion && application.campaignViewRegion !== 'WORLD' && (
                        <p className={styles.appMeta}>
                          {application.viewsGeographyKnown === false ? (
                            <span className={ui.hintWarn}>
                              География недоступна: просмотры в расчёт не идут
                            </span>
                          ) : (
                            <>
                              В расчёт: <b>{formatViews(application.payableViews ?? 0)}</b> просмотров
                            </>
                          )}
                        </p>
                      )}
                      <CreatorSocials userId={application.creatorId} />
                      {application.fraudStatus === 'SUSPICIOUS' && (
                        <p className={ui.hintWarn}>
                          Антифрод заметил признаки накрутки: деньги креатору заморожены до решения
                          платформы. Вы можете отклонить отклик сами.
                        </p>
                      )}
                      {application.fraudStatus === 'FRAUD' && (
                        <p className={ui.hintWarn}>
                          Накрутка: начисление по ролику обнулено, бюджет не тратится.
                        </p>
                      )}
                      <FraudFlags flags={application.fraudFlags} />
                      <div className={styles.appActions}>
                        {APPLICATION_ACTIONS.filter((action) => action.status !== application.status).map(
                          (action) => (
                            <button
                              key={action.status}
                              type="button"
                              className={`${actionClass(action.status)} ${ui.btnSmall}`}
                              onClick={() => handleApplicationStatus(application, action.status)}
                              disabled={busyApplicationId === application.id}
                            >
                              {action.label}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CampaignOverview;
