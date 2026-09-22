import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { OPERATION_STATUS_LABELS, WALLET_TRANSACTION_LABELS } from '../../shared/dictionaries';
import { financeOperationLink } from '../../shared/routes';
import styles from './FinanceOperations.module.css';
import Field from '../shared/Field/Field';

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
    <div className={styles.wrap}>
      <h1 className={styles.title}>Все операции</h1>
      <p className={styles.subtitle}>
        Одна таблица по всем кошелькам: пополнения заказчиков, резервы под объявления,
        начисления креаторам и выводы в USDT. У каждой строки видно, откуда и куда ушли деньги.
      </p>

      <div className={styles.filters}>
        <Field label="Имя, объявление, адрес" className={styles.searchField} pill>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
        </Field>
        <Field label="Тип операции" pill>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
          >
            <option value="">все типы</option>
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {WALLET_TRANSACTION_LABELS[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Статус операции" pill>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.select}
          >
            <option value="">все статусы</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {OPERATION_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </Field>
        <span className={styles.count}>
          {visible.length} из {rows.length}
        </span>
      </div>

      <section className={styles.card}>
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
