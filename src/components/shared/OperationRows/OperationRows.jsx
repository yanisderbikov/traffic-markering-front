import React from 'react';
import { Link } from 'react-router-dom';
import { signedRubles } from '../../../shared/money';
import {
  OPERATION_STATUS_LABELS,
  WALLET_TRANSACTION_LABELS,
  formatDate,
} from '../../../shared/dictionaries';
import styles from './OperationRows.module.css';

const STATUS_CLASS = {
  DONE: styles.statusDone,
  PENDING: styles.statusPending,
  SENT: styles.statusSent,
  CONFIRMED: styles.statusConfirmed,
  REJECTED: styles.statusRejected,
  CANCELLED: styles.statusCancelled,
};

const POINT_CLASS = {
  EXTERNAL: styles.pointExternal,
  CUSTOMER_WALLET: styles.pointCustomer,
  CAMPAIGN: styles.pointCampaign,
  CREATOR_WALLET: styles.pointCreator,
  TRON: styles.pointTron,
};

export const StatusBadge = ({ status, description }) => (
  <span className={`${styles.status} ${STATUS_CLASS[status] || ''}`}>
    {OPERATION_STATUS_LABELS[status] || description || status}
  </span>
);

export const FlowPoint = ({ point }) =>
  point ? (
    <span className={`${styles.point} ${POINT_CLASS[point.kind] || ''}`} title={point.label}>
      {point.label}
    </span>
  ) : (
    <span className={styles.point}>—</span>
  );

export const MoneyFlow = ({ source, destination }) => (
  <span className={styles.flow}>
    <FlowPoint point={source} />
    <span className={styles.arrow} aria-hidden="true">
      →
    </span>
    <FlowPoint point={destination} />
  </span>
);

const OperationRows = ({ rows, loading, error, linkFor, emptyText }) => {
  if (error) return <p className={styles.banner}>{error}</p>;
  if (loading) return <p className={styles.message}>Загрузка операций…</p>;
  if (!rows.length) return <p className={styles.message}>{emptyText || 'Операций пока нет.'}</p>;

  return (
    <div className={styles.table} role="table">
      <div className={`${styles.row} ${styles.header}`} role="row">
        <span role="columnheader">дата</span>
        <span role="columnheader">операция</span>
        <span role="columnheader">откуда → куда</span>
        <span role="columnheader" className={styles.right}>
          сумма
        </span>
        <span role="columnheader" className={styles.right}>
          статус
        </span>
      </div>
      {rows.map((row) => {
        const closed = row.status === 'REJECTED' || row.status === 'CANCELLED';
        return (
          <Link key={row.id} to={linkFor(row)} className={styles.row} role="row">
            <span className={styles.date} role="cell">
              {formatDate(row.createdAt)}
            </span>
            <span className={styles.what} role="cell">
              <span className={styles.title}>
                {WALLET_TRANSACTION_LABELS[row.type] || row.title || row.type}
              </span>
              {row.subtitle && <span className={styles.subtitle}>{row.subtitle}</span>}
            </span>
            <span role="cell" className={styles.flowCell}>
              <MoneyFlow source={row.source} destination={row.destination} />
            </span>
            <span
              role="cell"
              className={`${styles.amount} ${
                closed ? styles.amountClosed : row.amountKopecks > 0 ? styles.amountIn : ''
              }`}
            >
              {signedRubles(row.amountKopecks)}
            </span>
            <span role="cell" className={styles.statusCell}>
              <StatusBadge status={row.status} description={row.statusDescription} />
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default OperationRows;
