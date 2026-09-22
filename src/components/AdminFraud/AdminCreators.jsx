import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { TrustBadge } from '../shared/FraudBadge/FraudBadge';
import { errorMessage } from '../../shared/auth';
import { TRUST_LEVELS, TRUST_LEVEL_LABELS, formatDate } from '../../shared/dictionaries';
import styles from './AdminFraud.module.css';

const CREATORS_URL = '/api/admin/fraud/creators';
const AUTO = 'AUTO';

const matches = (creator, query) =>
  [creator.email, creator.name].filter(Boolean).some((value) => value.toLowerCase().includes(query));

const AdminCreators = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await apiClient.instance.get(CREATORS_URL);
      setCreators(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить креаторов'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeLevel = async (creator, value) => {
    const manual = value !== AUTO;
    const label = manual ? TRUST_LEVEL_LABELS[value] || value : 'автоматика';
    if (!window.confirm(`${creator.name}: выставить «${label}»?`)) return;
    const note = window.prompt('Причина (необязательно)', creator.note || '') ?? '';
    setBusyId(creator.userId);
    try {
      await apiClient.instance.patch(`${CREATORS_URL}/${creator.userId}/trust`, {
        trustLevel: manual ? value : null,
        note: note.trim() || undefined,
      });
      toast.success(`${creator.name}: ${label}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сменить репутацию'));
    } finally {
      setBusyId(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () => (normalizedQuery ? creators.filter((c) => matches(c, normalizedQuery)) : creators),
    [creators, normalizedQuery]
  );

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Репутация креаторов</h1>
      <p className={styles.subtitle}>
        Новичку оплачивается ограниченное число просмотров на ролик, после трёх чистых оплаченных
        роликов он становится проверенным. Подтверждённая накрутка ограничивает: деньги уходят
        только после ручной проверки каждого ролика; вторая — блокирует. Уровень, выставленный
        руками, автоматика не трогает. Очередь роликов — <Link to="/app/admin/fraud">здесь</Link>.
      </p>

      <section className={styles.card}>
        <div className={styles.listHead}>
          <h2 className={styles.cardTitle}>Креаторы</h2>
          <div className={styles.controls}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.search}
              placeholder="почта или имя"
              aria-label="Поиск по почте или имени"
            />
          </div>
        </div>

        {pageError && <p className={styles.banner}>{pageError}</p>}

        {loading ? (
          <p className={styles.message}>Загрузка…</p>
        ) : visible.length === 0 ? (
          <p className={styles.message}>
            {normalizedQuery ? 'Никого не нашлось по запросу.' : 'Креаторов пока нет.'}
          </p>
        ) : (
          <ul className={styles.list}>
            {visible.map((creator) => (
              <li key={creator.userId} className={styles.item}>
                <div className={styles.itemHead}>
                  <div className={styles.who}>
                    <span className={styles.name}>{creator.name}</span>
                    <span className={styles.email}>{creator.email}</span>
                  </div>
                  <div className={styles.trustCell}>
                    <TrustBadge level={creator.trustLevel} />
                    <select
                      value={creator.manual ? creator.trustLevel : AUTO}
                      onChange={(e) => changeLevel(creator, e.target.value)}
                      className={styles.select}
                      disabled={busyId === creator.userId}
                      aria-label={`Репутация ${creator.email}`}
                    >
                      <option value={AUTO}>автоматика</option>
                      {TRUST_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          вручную: {TRUST_LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className={styles.stats}>
                  <span>откликов: {creator.totalApplications ?? 0}</span>
                  <span>чистых оплаченных: {creator.cleanPaid ?? 0}</span>
                  <span>на проверке: {creator.suspicious ?? 0}</span>
                  <span className={creator.strikes ? styles.statStrike : undefined}>
                    накруток: {creator.strikes ?? 0}
                  </span>
                  {creator.registeredAt && <span>с нами с {formatDate(creator.registeredAt)}</span>}
                </p>

                {(creator.note || creator.updatedAt) && (
                  <p className={styles.note}>
                    {creator.manual ? 'выставлено вручную' : 'автоматика'}
                    {creator.updatedBy ? ` · ${creator.updatedBy}` : ''}
                    {creator.updatedAt ? ` · ${formatDate(creator.updatedAt)}` : ''}
                    {creator.note ? ` · ${creator.note}` : ''}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminCreators;
