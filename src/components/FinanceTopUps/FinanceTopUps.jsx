import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import Skeleton from '../shared/Skeleton/Skeleton';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import ui from '../../shared/ui.module.css';
import styles from './FinanceTopUps.module.css';

const FILTERS = [
  { key: 'SENT', label: 'На проверке', match: (row) => row.status === 'SENT' },
  { key: 'PENDING', label: 'Ждут оплаты', match: (row) => row.status === 'PENDING' },
  { key: 'ALL', label: 'Все', match: () => true },
];

const FinanceTopUps = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [filter, setFilter] = useState('SENT');

  const load = useCallback(async () => {
    try {
      const res = await apiClient.api.financeTopUps();
      setRows(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить заявки'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = FILTERS.find((item) => item.key === filter) || FILTERS[0];
  const visible = useMemo(() => rows.filter(current.match), [rows, current]);
  const onReview = useMemo(() => rows.filter((row) => row.status === 'SENT'), [rows]);
  const onReviewTotal = onReview.reduce((sum, row) => sum + (row.amountKopecks || 0), 0);

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Финансы</span>
          <h1 className={ui.title}>Пополнения</h1>
          <p className={ui.subtitle}>
            {loading ? (
              <Skeleton width="min(28rem, 90%)" />
            ) : onReview.length ? (
              `На проверке: ${onReview.length} на ${formatRubles(onReviewTotal)}. Сверьте поступление на адрес платформы и зачислите.`
            ) : (
              'Рекламодатели заводят заявки сами — сейчас проверять нечего.'
            )}
          </p>
        </div>
      </header>

      <div className={`${ui.chips} ${styles.filters}`} role="group" aria-label="Фильтр заявок">
        {FILTERS.map((item) => {
          const count = rows.filter(item.match).length;
          return (
            <button
              key={item.key}
              type="button"
              className={filter === item.key ? ui.chipActive : ui.chip}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label}
              <span className={styles.count}>{loading ? <Skeleton width="1ch" /> : count}</span>
            </button>
          );
        })}
      </div>

      <section className={ui.card}>
        <OperationRows
          rows={visible}
          loading={loading}
          error={pageError}
          linkFor={(row) => `/app/finance/operations/${row.publicId}`}
          emptyText="Заявок с таким статусом нет."
        />
      </section>
    </div>
  );
};

export default FinanceTopUps;
