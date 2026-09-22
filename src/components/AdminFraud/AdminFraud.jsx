import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { FraudBadge, FraudFlags, TrustBadge } from '../shared/FraudBadge/FraudBadge';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
import { APPLICATION_STATUS_LABELS, PLATFORM_LABELS, formatDate } from '../../shared/dictionaries';
import styles from './AdminFraud.module.css';

const FRAUD_URL = '/api/admin/fraud';

const FILTERS = [
  { value: 'attention', label: 'требуют внимания' },
  { value: 'FRAUD', label: 'накрутка' },
  { value: 'SUSPICIOUS', label: 'на проверке' },
  { value: 'VERIFIED', label: 'проверенные' },
  { value: 'CLEAN', label: 'чистые' },
  { value: 'all', label: 'все' },
];

const DECISIONS = {
  VERIFIED: { label: 'Честно', confirm: 'Подтвердить, что просмотры честные? Зачисление разморозится.' },
  FRAUD: {
    label: 'Накрутка',
    confirm: 'Подтвердить накрутку? Начисление обнулится, креатор получит страйк.',
  },
  AUTO: { label: 'Вернуть автоматике', confirm: 'Снять ручное решение и вернуть отклик скорингу?' },
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
    <div className={styles.wrap}>
      <h1 className={styles.title}>Подозрительные ролики</h1>
      <p className={styles.subtitle}>
        Скоринг считается после каждого замера просмотров. С порога «на проверке» деньги копятся
        на отклике, но в кошелёк не уезжают; с порога «накрутка» начисление обнуляется. Решение
        админа автоматика больше не перебивает. Репутация креаторов —{' '}
        <Link to="/app/admin/fraud/creators">отдельно</Link>.
      </p>

      <section className={styles.card}>
        <div className={styles.listHead}>
          <h2 className={styles.cardTitle}>Очередь</h2>
          <div className={styles.controls}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.select}
              aria-label="Фильтр по вердикту"
            >
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="button" className={styles.ghostBtn} onClick={recheckAll} disabled={rechecking}>
              {rechecking ? 'Проверяем…' : 'Перепроверить все'}
            </button>
          </div>
        </div>

        {pageError && <p className={styles.banner}>{pageError}</p>}

        {loading ? (
          <p className={styles.message}>Загрузка…</p>
        ) : items.length === 0 ? (
          <p className={styles.message}>Пусто: подозрительных роликов нет.</p>
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
                      <span className={styles.meta}>
                        {APPLICATION_STATUS_LABELS[application.status] || application.status}
                      </span>
                    </div>
                  </div>

                  <p className={styles.meta}>
                    {application.campaignTitle}
                    {' · '}
                    {PLATFORM_LABELS[application.platform] || application.platform}
                    {' · отклик от '}
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
                      просмотров: <b>{formatViews(application.views ?? 0)}</b>
                    </span>
                    <span>
                      в расчёт: <b>{formatViews(application.payableViews ?? 0)}</b>
                    </span>
                    <span>
                      начислено: <b>{formatRubles(application.accruedKopecks ?? 0)}</b>
                    </span>
                    <span>
                      зачислено: <b>{formatRubles(application.creditedKopecks ?? 0)}</b>
                    </span>
                    {item.uncreditedKopecks > 0 && (
                      <span className={styles.frozen}>
                        ждёт: {formatRubles(item.uncreditedKopecks)}
                      </span>
                    )}
                  </p>
                  {metrics && <p className={styles.numbers}>{metrics}</p>}

                  <FraudFlags flags={application.fraudFlags} />

                  {item.fraudReviewedAt && (
                    <p className={styles.review}>
                      решение {item.fraudReviewedBy ? `${item.fraudReviewedBy}, ` : ''}
                      {formatDate(item.fraudReviewedAt)}
                      {item.fraudReviewComment ? `: ${item.fraudReviewComment}` : ''}
                    </p>
                  )}

                  <div className={styles.actions}>
                    {application.fraudStatus !== 'VERIFIED' && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => review(item, 'VERIFIED')}
                        disabled={busy}
                      >
                        {DECISIONS.VERIFIED.label}
                      </button>
                    )}
                    {!(application.fraudStatus === 'FRAUD' && item.fraudReviewedAt) && (
                      <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={() => review(item, 'FRAUD')}
                        disabled={busy}
                      >
                        {DECISIONS.FRAUD.label}
                      </button>
                    )}
                    {item.fraudReviewedAt && (
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => review(item, 'AUTO')}
                        disabled={busy}
                      >
                        {DECISIONS.AUTO.label}
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.ghostBtn}
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
