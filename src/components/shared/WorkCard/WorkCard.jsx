import React from 'react';
import { Link } from 'react-router-dom';
import { FraudBadge } from '../FraudBadge/FraudBadge';
import Skeleton from '../Skeleton/Skeleton';
import { formatRubles, formatViews } from '../../../shared/money';
import { PLATFORM_LABELS, formatDate } from '../../../shared/dictionaries';
import { isWorldRegion } from '../../../shared/viewRegion';
import ui from '../../../shared/ui.module.css';
import styles from './WorkCard.module.css';

const STAGES = ['Отклик', 'Одобрено', 'Просмотры', 'Начисления'];

const stageOf = (application) => {
  switch (application.status) {
    case 'APPROVED':
      return (application.views ?? 0) > 0 ? 3 : 2;
    case 'COMPLETED':
      return 4;
    case 'REJECTED':
      return 0;
    default:
      return 1;
  }
};

const STATUS_CHIP = {
  PENDING: { className: ui.chipWarning, label: 'Ждёт решения бренда' },
  APPROVED: { className: ui.chipSuccess, label: 'В работе' },
  COMPLETED: { className: ui.chipOutline, label: 'Завершена' },
  REJECTED: { className: ui.chipDanger, label: 'Отклонена' },
};

const hintOf = (application) => {
  switch (application.status) {
    case 'PENDING':
      return 'Бренд смотрит вашу заявку. Ролик уже можно дорабатывать по брифу.';
    case 'APPROVED':
      return 'Просмотры считаются автоматически по ссылке на ролик.';
    case 'COMPLETED':
      return 'Работа завершена. Начисления по ней остаются в кошельке.';
    case 'REJECTED':
      return 'Бренд не принял эту работу. Попробуйте другой оффер.';
    default:
      return '';
  }
};

const WorkCard = ({ application, onWithdraw, busy = false }) => {
  const stage = stageOf(application);
  const percent = Math.round((stage / STAGES.length) * 100);
  const chip = STATUS_CHIP[application.status] || {
    className: ui.chipOutline,
    label: application.statusDescription || application.status,
  };
  const platform =
    application.platformDescription || PLATFORM_LABELS[application.platform] || application.platform;
  const geographyMissing =
    !isWorldRegion(application.campaignViewRegion) && application.viewsGeographyKnown === false;
  const fraud = application.fraudStatus === 'SUSPICIOUS' || application.fraudStatus === 'FRAUD';

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headMain}>
          <span className={styles.avatar} aria-hidden="true">
            {(application.campaignTitle || '·').trim().charAt(0).toUpperCase()}
          </span>
          <div className={styles.titles}>
            <span className={styles.kicker}>
              {platform}
              {application.createdAt ? ` · отклик от ${formatDate(application.createdAt)}` : ''}
            </span>
            <h3 className={styles.title}>{application.campaignTitle}</h3>
          </div>
        </div>
        <div className={styles.badges}>
          <FraudBadge status={application.fraudStatus} />
          <span className={chip.className}>{chip.label}</span>
        </div>
      </div>

      <ol className={styles.stages} aria-label="Этапы работы">
        {STAGES.map((label, index) => (
          <li
            key={label}
            className={`${styles.stage} ${
              index < stage ? styles.stageDone : index === stage ? styles.stageCurrent : ''
            }`}
          >
            {label}
          </li>
        ))}
      </ol>
      <div className={ui.track} aria-hidden="true">
        <div className={ui.fill} style={{ width: `${percent}%` }} />
      </div>

      <div className={styles.numbers}>
        <span>
          <span className={ui.muted}>Ставка </span>
          <b>{formatRubles(application.ratePerThousandKopecks)}</b>
          <span className={ui.muted}> / 1 000</span>
        </span>
        <span>
          <span className={ui.muted}>Просмотров </span>
          <b>{formatViews(application.views ?? 0)}</b>
        </span>
        {!isWorldRegion(application.campaignViewRegion) && !geographyMissing && (
          <span>
            <span className={ui.muted}>В расчёт </span>
            <b>{formatViews(application.payableViews ?? 0)}</b>
          </span>
        )}
        <span>
          <span className={ui.muted}>Начислено </span>
          <b className={ui.success}>{formatRubles(application.accruedKopecks ?? 0)}</b>
        </span>
      </div>

      <p className={styles.hint}>{hintOf(application)}</p>
      {geographyMissing && (
        <p className={styles.warn}>
          География просмотров недоступна: просмотры по этой работе не оплачиваются.
        </p>
      )}
      {fraud && (
        <p className={styles.warn}>
          {application.fraudStatus === 'FRAUD'
            ? 'Платформа признала просмотры накрученными: начисление обнулено.'
            : 'Просмотры на проверке: платформа заметила признаки накрутки, деньги заморожены до решения.'}
        </p>
      )}

      <div className={styles.footer}>
        {application.videoUrl && (
          <a className={styles.video} href={application.videoUrl} target="_blank" rel="noreferrer">
            {application.videoUrl}
          </a>
        )}
        <div className={styles.actions}>
          {application.campaignPublicId && (
            <Link to={`/campaigns/${application.campaignPublicId}`} className={ui.linkMuted}>
              Открыть оффер
            </Link>
          )}
          {onWithdraw && application.status === 'PENDING' && (
            <button
              type="button"
              className={`${ui.btnDanger} ${ui.btnSmall}`}
              onClick={() => onWithdraw(application)}
              disabled={busy}
            >
              Отозвать
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const WorkCardSkeleton = () => (
  <article className={styles.card} aria-hidden="true">
    <div className={styles.head}>
      <div className={styles.headMain}>
        <Skeleton width={48} height={48} radius={12} />
        <div className={styles.titles}>
          <span className={styles.kicker}>
            <Skeleton width="18ch" />
          </span>
          <h3 className={styles.title}>
            <Skeleton width="14ch" />
          </h3>
        </div>
      </div>
      <Skeleton width="10rem" height={30} radius="999px" />
    </div>
    <ol className={styles.stages}>
      {STAGES.map((label) => (
        <li key={label} className={styles.stage}>
          <Skeleton width="70%" />
        </li>
      ))}
    </ol>
    <Skeleton block height={6} radius={3} />
    <div className={styles.numbers}>
      <Skeleton width="9rem" />
      <Skeleton width="8rem" />
      <Skeleton width="9rem" />
    </div>
    <p className={styles.hint}>
      <Skeleton width="min(28rem, 90%)" />
    </p>
  </article>
);

export default WorkCard;
