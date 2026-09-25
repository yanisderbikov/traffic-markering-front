import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import ui from '../../shared/ui.module.css';
import styles from './FinancePayouts.module.css';

const FILTERS = [
  { key: 'OPEN', label: 'В работе', match: (row) => row.status === 'PENDING' || row.status === 'SENT' },
  { key: 'PENDING', label: 'Ждут отправки', match: (row) => row.status === 'PENDING' },
  { key: 'SENT', label: 'Ждут подтверждения', match: (row) => row.status === 'SENT' },
  { key: 'ALL', label: 'Все', match: () => true },
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
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Финансы</span>
          <h1 className={ui.title}>Выплаты креаторам</h1>
          <p className={ui.subtitle}>
            {pendingCount
              ? `Ждут отправки: ${pendingCount} на ${formatRubles(pendingTotal)}.`
              : 'Все заявки отправлены — новых пока нет.'}
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
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>

      <section className={ui.card}>
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
