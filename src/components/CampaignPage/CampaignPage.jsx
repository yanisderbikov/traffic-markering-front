import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import MaterialList from '../shared/MaterialList/MaterialList';
import PlatformList from '../shared/PlatformList/PlatformList';
import { formatRubles, formatViews } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, formatDate } from '../../shared/dictionaries';
import { formatDay, periodState } from '../../shared/dates';
import { campaignRequirements } from '../../shared/requirements';
import { viewRegionHint } from '../../shared/viewRegion';
import styles from './CampaignPage.module.css';

const CampaignPage = () => {
  const { publicId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const authorized = apiClient.hasLiveToken();
  const role = authorized ? apiClient.getJwtMetadata()?.role : null;
  const isCreator = role === 'CREATOR';

  const loadCampaign = useCallback(async () => {
    try {
      const res = await apiClient.api.boardCampaign(publicId);
      setCampaign(res.data);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить объявление'
      );
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const requirements = campaignRequirements(campaign);
  const materials = Array.isArray(campaign?.materials) ? campaign.materials : [];
  const period = campaign ? periodState(campaign.startsAt, campaign.endsAt) : 'current';

  const renderApplyBlock = () => {
    if (!authorized) {
      const from = encodeURIComponent(`/campaigns/${publicId}/apply`);
      return (
        <div className={styles.applyBlock}>
          <p className={styles.noticeText}>
            чтобы взять заказ в работу, войдите как креатор или заведите аккаунт — это минута.
          </p>
          <div className={styles.noticeActions}>
            <Link to={`/login?from=${from}`} className={styles.primaryLink}>
              войти
            </Link>
            <Link to="/register" className={styles.secondaryLink}>
              зарегистрироваться
            </Link>
          </div>
        </div>
      );
    }

    if (!isCreator) {
      return (
        <div className={styles.applyBlock}>
          <p className={styles.noticeText}>
            отклики оставляют креаторы. вы вошли как {role === 'CUSTOMER' ? 'заказчик' : 'администратор'} —
            своё объявление можно вести в личном кабинете.
          </p>
          <div className={styles.noticeActions}>
            <Link to="/app" className={styles.secondaryLink}>
              личный кабинет
            </Link>
          </div>
        </div>
      );
    }

    if (campaign.status !== 'ACTIVE') {
      return (
        <div className={styles.applyBlock}>
          <p className={styles.noticeText}>
            объявление сейчас {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status} —
            новые отклики заказчик не принимает.
          </p>
        </div>
      );
    }

    if (period === 'upcoming') {
      return (
        <div className={styles.applyBlock}>
          <p className={styles.noticeText}>
            приём откликов откроется {formatDay(campaign.startsAt)} — пока можно изучить задачу
            и материалы.
          </p>
        </div>
      );
    }

    if (period === 'ended') {
      return (
        <div className={styles.applyBlock}>
          <p className={styles.noticeText}>
            приём откликов закончился {formatDay(campaign.endsAt)} — новые ролики заказчик не
            принимает.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.applyBlock}>
        <p className={styles.noticeText}>
          снимите ролик, приложите ссылку — просмотры посчитаются автоматически.{' '}
          {viewRegionHint(campaign.viewRegion, campaign.platforms)}.
        </p>
        <Link to={`/campaigns/${publicId}/apply`} className={styles.applyButton}>
          взять в работу
        </Link>
      </div>
    );
  };

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.backLink}>
        ← к доске объявлений
      </Link>

      {loading ? (
        <p className={styles.message}>Загрузка объявления…</p>
      ) : pageError ? (
        <p className={styles.errorBanner}>{pageError}</p>
      ) : !campaign ? (
        <p className={styles.message}>Объявление не найдено.</p>
      ) : (
        <article className={styles.card}>
          <h1 className={styles.title}>{campaign.title}</h1>
          <p className={styles.cardMeta}>
            {campaign.customerCompany || campaign.customerName}
            {campaign.createdAt ? ` · ${formatDate(campaign.createdAt)}` : ''}
            {campaign.statusDescription ? ` · ${campaign.statusDescription}` : ''}
          </p>

          {campaign.photoUrl && (
            <div className={styles.media}>
              <img
                className={styles.mediaBackdrop}
                src={campaign.photoUrl}
                alt=""
                aria-hidden="true"
              />
              <img className={styles.mediaPhoto} src={campaign.photoUrl} alt={campaign.title} />
            </div>
          )}

          <p className={styles.rate}>
            {formatRubles(campaign.ratePerThousandKopecks)}
            <span className={styles.rateUnit}> / 1000 просмотров</span>
          </p>

          <p className={styles.description}>{campaign.description}</p>

          {requirements.length > 0 && (
            <section className={styles.requirements} aria-label="Требования к ролику">
              <h2 className={styles.sectionTitle}>требования к ролику</h2>
              <dl className={styles.requirementList}>
                {requirements.map((row) => (
                  <div key={row.key} className={styles.requirement}>
                    <dt className={styles.requirementKey}>{row.label}</dt>
                    <dd className={styles.requirementValue}>
                      {row.value}
                      {row.hint && <span className={styles.requirementHint}>{row.hint}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {materials.length > 0 && (
            <section className={styles.materials} aria-label="Материалы">
              <h2 className={styles.sectionTitle}>материалы от заказчика</h2>
              <MaterialList materials={materials} />
            </section>
          )}

          <div className={styles.budgetBlock}>
            <BudgetBar
              budgetKopecks={campaign.budgetKopecks}
              spentKopecks={campaign.spentKopecks}
            />
            <p className={styles.remaining}>
              на объявлении лежит{' '}
              <strong className={styles.remainingValue}>
                {formatRubles(campaign.remainingKopecks)}
              </strong>{' '}
              — столько ещё можно заработать на просмотрах.
            </p>
          </div>

          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt className={styles.factKey}>заказчик</dt>
              <dd className={styles.factValue}>
                {campaign.customerCompany || campaign.customerName || '—'}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factKey}>вывод от</dt>
              <dd className={styles.factValue}>{formatRubles(campaign.minPayoutKopecks)}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factKey}>откликов</dt>
              <dd className={styles.factValue}>{campaign.applicationsCount ?? 0}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factKey}>просмотров набрано</dt>
              <dd className={styles.factValue}>{formatViews(campaign.totalViews ?? 0)}</dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt className={styles.factKey}>принимаются ролики с</dt>
              <dd className={styles.factValue}>
                <PlatformList platforms={campaign.platforms} />
              </dd>
            </div>
          </dl>

          {renderApplyBlock()}
        </article>
      )}
    </div>
  );
};

export default CampaignPage;
