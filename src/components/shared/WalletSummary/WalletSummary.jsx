import React from 'react';
import FitRubles from '../FitRubles/FitRubles';
import Skeleton from '../Skeleton/Skeleton';
import styles from './WalletSummary.module.css';

const Amount = ({ loading, kopecks, className }) =>
  loading ? (
    <span className={className}>
      <Skeleton width="7ch" />
    </span>
  ) : (
    <FitRubles className={className} kopecks={kopecks ?? 0} />
  );

const WalletSummary = ({ wallet, loading = false }) => (
  <div className={styles.summary} aria-busy={loading || undefined}>
    <div className={styles.item}>
      <span className={styles.label}>Свободно</span>
      <Amount
        loading={loading}
        className={`${styles.value} ${styles.free}`}
        kopecks={wallet?.balanceKopecks}
      />
    </div>
    <div className={styles.item}>
      <span className={styles.label}>В кампаниях</span>
      <Amount loading={loading} className={styles.value} kopecks={wallet?.allocatedKopecks} />
    </div>
    <div className={styles.item}>
      <span className={styles.label}>Начислено креаторам</span>
      <Amount loading={loading} className={styles.value} kopecks={wallet?.spentKopecks} />
    </div>
  </div>
);

export default WalletSummary;
