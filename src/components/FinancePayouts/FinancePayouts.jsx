import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import styles from './FinancePayouts.module.css';

const FILTERS = [
  { key: 'OPEN', label: 'в работе', match: (row) => row.status === 'PENDING' || row.status === 'SENT' },
  { key: 'PENDING', label: 'ждут отправки', match: (row) => row.status === 'PENDING' },
  { key: 'SENT', label: 'ждут подтверждения', match: (row) => row.status === 'SENT' },
  { key: 'ALL', label: 'все', match: () => true },
];

const FinancePayouts = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [filter, setFilter] = useState('OPEN');

  const load = useCallback(async () => {
    try {
      const res = await apiClient.api.financePayouts();
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
  const pendingTotal = useMemo(
    () =>
      rows
        .filter((row) => row.status === 'PENDING')
        .reduce((sum, row) => sum + Math.abs(row.amountKopecks || 0), 0),
    [rows]
  );
  const pendingCount = rows.filter((row) => row.status === 'PENDING').length;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Выплаты креаторам</h1>
      <p className={styles.subtitle}>
        {pendingCount
          ? `Ждут отправки: ${pendingCount} на ${formatRubles(pendingTotal)}.`
          : 'Все заявки отправлены — новых пока нет.'}
      </p>

      <div className={styles.tabs} role="group" aria-label="Фильтр заявок">
        {FILTERS.map((item) => {
          const count = rows.filter(item.match).length;
          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.tab} ${filter === item.key ? styles.tabActive : ''}`}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <section className={styles.card}>
        <OperationRows
          rows={visible}
          loading={loading}
          error={pageError}
          linkFor={(row) => `/app/finance/payouts/${row.id}`}
          emptyText="Заявок с таким статусом нет."
        />
      </section>
    </div>
  );
};

export default FinancePayouts;
