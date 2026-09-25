import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { FraudBadge, FraudFlags, TrustBadge } from '../shared/FraudBadge/FraudBadge';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
import { APPLICATION_STATUS_LABELS, PLATFORM_LABELS, formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './AdminFraud.module.css';

const FRAUD_URL = '/api/admin/fraud';

const FILTERS = [
  { value: 'attention', label: 'Требуют внимания' },
  { value: 'FRAUD', label: 'Накрутка' },
  { value: 'SUSPICIOUS', label: 'На проверке' },
  { value: 'VERIFIED', label: 'Проверенные' },
  { value: 'CLEAN', label: 'Чистые' },
  { value: 'all', label: 'Все' },
];

const DECISIONS = {
  VERIFIED: { label: 'Честно', confirm: 'Подтвердить, что просмотры честные? Зачисление разморозится.' },
  FRAUD: {
    label: 'Накрутка',
    confirm: 'Подтвердить накрутку? Начисление обнулится, креатор получит страйк.',
  },
  AUTO: { label: 'Вернуть автоматике', confirm: 'Снять ручное решение и вернуть работу скорингу?' },
};

const metricsLine = (snapshot) => {
  if (!snapshot) return null;
  const parts = [];
  if (snapshot.likes != null) parts.push(`лайков ${formatViews(snapshot.likes)}`);
  if (snapshot.comments != null) parts.push(`комментариев ${formatViews(snapshot.comments)}`);
  if (snapshot.shares != null) parts.push(`репостов ${formatViews(snapshot.shares)}`);
  if (snapshot.reach != null) parts.push(`охват ${formatViews(snapshot.reach)}`);
  if (snapshot.engagedViews != null) parts.push(`досмотров ${formatViews(snapshot.engagedViews)}`);
  if (snapshot.avgViewPercentage != null)
    parts.push(`досмотр ${Number(snapshot.avgViewPercentage).toFixed(1)} %`);
  if (snapshot.avgWatchSeconds != null)
    parts.push(`смотрят ${Number(snapshot.avgWatchSeconds).toFixed(1)} с`);
  return parts.length ? parts.join(' · ') : null;
};

const AdminFraud = () => {
  const [filter, setFilter] = useState('attention');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rechecking, setRechecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.instance.get(`${FRAUD_URL}/applications`, { params: { filter } });
      setItems(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить очередь антифрода'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const review = async (item, decision) => {
    const { label, confirm } = DECISIONS[decision];
    if (!window.confirm(confirm)) return;
    const comment = window.prompt('Комментарий к решению (необязательно)', '') ?? '';
    setBusyId(item.application.id);
    try {
      await apiClient.instance.patch(`${FRAUD_URL}/applications/${item.application.id}/review`, {
        decision,
        comment: comment.trim() || undefined,
      });
      toast.success(`${item.application.publicId}: ${label.toLowerCase()}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сохранить решение'));
    } finally {
      setBusyId(null);
    }
  };

  const recheck = async (item) => {
    setBusyId(item.application.id);
    try {
      await apiClient.instance.post(`${FRAUD_URL}/applications/${item.application.id}/recheck`);
      toast.success(`${item.application.publicId}: перепроверен`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось перепроверить'));
    } finally {
      setBusyId(null);
    }
  };

  const recheckAll = async () => {
    setRechecking(true);
    try {
      const res = await apiClient.instance.post(`${FRAUD_URL}/recheck`);
      toast.success(`Перепроверено роликов: ${res.data?.checked ?? 0}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось перепроверить'));
    } finally {
      setRechecking(false);
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Антифрод</span>
          <h1 className={ui.title}>Подозрительные ролики</h1>
          <p className={ui.subtitle}>
            Скоринг считается после каждого замера просмотров. С порога «на проверке» деньги копятся
            на работе, но в кошелёк не уезжают; с порога «накрутка» начисление обнуляется. Решение
            админа автоматика больше не перебивает. Репутация креаторов —{' '}
            <Link to="/app/admin/fraud/creators" className={ui.accent}>
              отдельно
            </Link>
            .
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <button
            type="button"
            className={ui.btnSecondary}
            onClick={recheckAll}
            disabled={rechecking}
          >
            {rechecking ? 'Проверяем…' : 'Перепроверить все'}
          </button>
        </div>
      </header>

      <div className={`${ui.chips} ${styles.filters}`} role="group" aria-label="Фильтр по вердикту">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={filter === option.value ? ui.chipActive : ui.chip}
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className={ui.card}>
        {pageError && <p className={ui.errorBanner}>{pageError}</p>}

        {loading ? (
          <p className={ui.message}>Загрузка…</p>
        ) : items.length === 0 ? (
          <p className={ui.message}>Пусто: подозрительных роликов нет.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => {
              const application = item.application;
              const busy = busyId === application.id;
              const metrics = metricsLine(item.latestSnapshot);
              return (
                <li key={application.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <div className={styles.who}>
                      <span className={styles.name}>{application.creatorName}</span>
                      <span className={styles.email}>{item.creatorEmail}</span>
                      <TrustBadge level={application.creatorTrustLevel} />
                    </div>
                    <div className={styles.badges}>
                      <FraudBadge status={application.fraudStatus} score={application.fraudScore} showClean />
                      <span className={ui.chipOutline}>
                        {APPLICATION_STATUS_LABELS[application.status] || application.status}
                      </span>
                    </div>
                  </div>

                  <p className={styles.meta}>
                    {application.campaignTitle}
                    {' · '}
                    {PLATFORM_LABELS[application.platform] || application.platform}
                    {' · работа от '}
                    {formatDate(application.createdAt)}
                    {application.videoPublishedAt
                      ? ` · ролик опубликован ${formatDate(application.videoPublishedAt)}`
                      : ''}
                    {item.creatorFollowers != null
                      ? ` · подписчиков ${formatViews(item.creatorFollowers)}`
                      : ''}
                  </p>

                  <a className={styles.videoLink} href={application.videoUrl} target="_blank" rel="noreferrer">
                    {application.videoUrl}
                  </a>

                  <p className={styles.numbers}>
                    <span>
                      Просмотров: <b>{formatViews(application.views ?? 0)}</b>
                    </span>
                    <span>
                      В расчёт: <b>{formatViews(application.payableViews ?? 0)}</b>
                    </span>
                    <span>
                      Начислено: <b>{formatRubles(application.accruedKopecks ?? 0)}</b>
                    </span>
                    <span>
                      Зачислено: <b>{formatRubles(application.creditedKopecks ?? 0)}</b>
                    </span>
                    {item.uncreditedKopecks > 0 && (
                      <span className={styles.frozen}>
                        Ждёт: {formatRubles(item.uncreditedKopecks)}
                      </span>
                    )}
                  </p>
                  {metrics && <p className={styles.metrics}>{metrics}</p>}

                  <FraudFlags flags={application.fraudFlags} />

                  {item.fraudReviewedAt && (
                    <p className={styles.review}>
                      Решение {item.fraudReviewedBy ? `${item.fraudReviewedBy}, ` : ''}
                      {formatDate(item.fraudReviewedAt)}
                      {item.fraudReviewComment ? `: ${item.fraudReviewComment}` : ''}
                    </p>
                  )}

                  <div className={styles.actions}>
                    {application.fraudStatus !== 'VERIFIED' && (
                      <button
                        type="button"
                        className={`${ui.btnPrimary} ${ui.btnSmall}`}
                        onClick={() => review(item, 'VERIFIED')}
                        disabled={busy}
                      >
                        {DECISIONS.VERIFIED.label}
                      </button>
                    )}
                    {!(application.fraudStatus === 'FRAUD' && item.fraudReviewedAt) && (
                      <button
                        type="button"
                        className={`${ui.btnDanger} ${ui.btnSmall}`}
                        onClick={() => review(item, 'FRAUD')}
                        disabled={busy}
                      >
                        {DECISIONS.FRAUD.label}
                      </button>
                    )}
                    {item.fraudReviewedAt && (
                      <button
                        type="button"
                        className={`${ui.btnGhost} ${ui.btnSmall}`}
                        onClick={() => review(item, 'AUTO')}
                        disabled={busy}
                      >
                        {DECISIONS.AUTO.label}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${ui.btnGhost} ${ui.btnSmall}`}
                      onClick={() => recheck(item)}
                      disabled={busy}
                    >
                      Перепроверить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminFraud;
