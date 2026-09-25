import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../Skeleton/Skeleton';
import { signedRubles } from '../../../shared/money';
import {
  WALLET_TRANSACTION_LABELS,
  formatDate,
  operationStatusLabel,
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

export const StatusBadge = ({ type, status, description }) => (
  <span className={`${styles.status} ${STATUS_CLASS[status] || ''}`}>
    {operationStatusLabel(type, status) || description || status}
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

const SKELETON_ROWS = 4;

const HeaderRow = () => (
  <div className={`${styles.row} ${styles.header}`} role="row">
    <span role="columnheader">Дата</span>
    <span role="columnheader">Операция</span>
    <span role="columnheader">Откуда → куда</span>
    <span role="columnheader" className={styles.right}>
      Сумма
    </span>
    <span role="columnheader" className={styles.right}>
      Статус
    </span>
  </div>
);

const SkeletonRow = () => (
  <div className={styles.row} aria-hidden="true">
    <span className={styles.date}>
      <Skeleton width="9ch" />
    </span>
    <span className={styles.what}>
      <span className={styles.title}>
        <Skeleton width="11ch" />
      </span>
      <span className={styles.subtitle}>
        <Skeleton width="16ch" />
      </span>
    </span>
    <span className={styles.flowCell}>
      <span className={styles.flow}>
        <Skeleton width="10ch" height="1.9em" radius="999px" />
        <Skeleton width="10ch" height="1.9em" radius="999px" />
      </span>
    </span>
    <span className={styles.amount}>
      <Skeleton width="8ch" />
    </span>
    <span className={styles.statusCell}>
      <Skeleton width="11ch" height="2.2em" radius="999px" />
    </span>
  </div>
);

const OperationRows = ({ rows, loading, error, linkFor, emptyText }) => {
  if (error) return <p className={styles.banner}>{error}</p>;
  if (loading) {
    return (
      <div className={styles.table} role="table" aria-busy="true">
        <HeaderRow />
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }
  if (!rows.length) return <p className={styles.message}>{emptyText || 'Операций пока нет.'}</p>;

  return (
    <div className={styles.table} role="table">
      <HeaderRow />
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
              <StatusBadge type={row.type} status={row.status} description={row.statusDescription} />
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default OperationRows;
