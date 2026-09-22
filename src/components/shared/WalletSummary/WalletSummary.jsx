import React from 'react';
import { formatRubles } from '../../../shared/money';
import styles from './WalletSummary.module.css';

const WalletSummary = ({ wallet }) => (
  <div className={styles.summary}>
    <div className={styles.item}>
      <span className={styles.label}>свободно</span>
      <span className={`${styles.value} ${styles.free}`}>
        {formatRubles(wallet?.balanceKopecks ?? 0)}
      </span>
    </div>
    <div className={styles.item}>
      <span className={styles.label}>в объявлениях</span>
      <span className={styles.value}>{formatRubles(wallet?.allocatedKopecks ?? 0)}</span>
    </div>
    <div className={styles.item}>
      <span className={styles.label}>начислено креаторам</span>
      <span className={styles.value}>{formatRubles(wallet?.spentKopecks ?? 0)}</span>
    </div>
  </div>
);

export default WalletSummary;
