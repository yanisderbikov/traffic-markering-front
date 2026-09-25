import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import Skeleton from '../shared/Skeleton/Skeleton';
import { errorMessage } from '../../shared/auth';
import { OPERATION_STATUS_LABELS, WALLET_TRANSACTION_LABELS } from '../../shared/dictionaries';
import { financeOperationLink } from '../../shared/routes';
import ui from '../../shared/ui.module.css';
import styles from './FinanceOperations.module.css';

const TYPES = Object.keys(WALLET_TRANSACTION_LABELS);
const STATUSES = Object.keys(OPERATION_STATUS_LABELS);

const matches = (row, query) =>
  [row.ownerName, row.subtitle, row.source?.label, row.destination?.label]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));

const FinanceOperations = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await apiClient.api.financeOperations();
      setRows(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить операции'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows
        .filter((row) => !type || row.type === type)
        .filter((row) => !status || row.status === status)
        .filter((row) => !normalizedQuery || matches(row, normalizedQuery)),
    [rows, type, status, normalizedQuery]
  );

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Финансы</span>
          <h1 className={ui.title}>Все операции</h1>
          <p className={ui.subtitle}>
            Одна таблица по всем кошелькам: пополнения рекламодателей, резервы под кампании,
            начисления креаторам и выводы в USDT. У каждой строки видно, откуда и куда ушли деньги.
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${ui.input} ${styles.search}`}
          placeholder="Имя, кампания, адрес"
          aria-label="Поиск по имени, кампании или адресу"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`${ui.input} ${styles.select}`}
          aria-label="Тип операции"
        >
          <option value="">Все типы</option>
          {TYPES.map((item) => (
            <option key={item} value={item}>
              {WALLET_TRANSACTION_LABELS[item]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${ui.input} ${styles.select}`}
          aria-label="Статус операции"
        >
          <option value="">Все статусы</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {OPERATION_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <span className={styles.count}>
          {loading ? <Skeleton width="6ch" /> : `${visible.length} из ${rows.length}`}
        </span>
      </div>

      <section className={ui.card}>
        <OperationRows
          rows={visible}
          loading={loading}
          error={pageError}
          linkFor={financeOperationLink}
          emptyText="Операций с такими условиями нет."
        />
      </section>
    </div>
  );
};

export default FinanceOperations;
