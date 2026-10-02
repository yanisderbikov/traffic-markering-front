import React from 'react';
import { commissionOf, formatPercent, formatRubles } from '../../../shared/money';
import ui from '../../../shared/ui.module.css';
import styles from './CommissionSummary.module.css';

const MODES = {
  onTop: { amountLabel: 'Зачислим на баланс', totalLabel: 'К оплате', sign: '+' },
  deducted: { amountLabel: 'Спишем с баланса', totalLabel: 'К переводу', sign: '−' },
};

export const totalWithCommission = (kopecks, percent, mode) => {
  const commission = commissionOf(kopecks, percent);
  return mode === 'deducted' ? kopecks - commission : kopecks + commission;
};

const CommissionSummary = ({ kopecks, percent, mode = 'onTop', amountLabel, totalLabel, className = '' }) => {
  if (!(Number(percent) > 0) || !(kopecks > 0)) return null;
  const labels = MODES[mode] || MODES.onTop;
  const commission = commissionOf(kopecks, percent);

  return (
    <div className={[styles.summary, className].filter(Boolean).join(' ')} aria-live="polite">
      <div className={ui.kv}>
        <span className={ui.kvKey}>{amountLabel || labels.amountLabel}</span>
        <span className={ui.kvValue}>{formatRubles(kopecks)}</span>
      </div>
      <div className={ui.kv}>
        <span className={ui.kvKey}>Комиссия платформы {formatPercent(percent)}</span>
        <span className={`${ui.kvValue} ${styles.commission}`}>
          {labels.sign} {formatRubles(commission)}
        </span>
      </div>
      <div className={`${ui.kv} ${styles.total}`}>
        <span className={ui.kvKey}>{totalLabel || labels.totalLabel}</span>
        <span className={ui.kvValue}>{formatRubles(totalWithCommission(kopecks, percent, mode))}</span>
      </div>
    </div>
  );
};

export default CommissionSummary;
