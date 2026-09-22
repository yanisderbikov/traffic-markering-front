import React from 'react';
import { FRAUD_STATUS_LABELS, TRUST_LEVEL_LABELS } from '../../../shared/dictionaries';
import styles from './FraudBadge.module.css';

const FRAUD_CLASS = {
  CLEAN: styles.clean,
  SUSPICIOUS: styles.suspicious,
  FRAUD: styles.fraud,
  VERIFIED: styles.verified,
};

const TRUST_CLASS = {
  NEW: styles.trustNew,
  TRUSTED: styles.trustTrusted,
  RESTRICTED: styles.trustRestricted,
  BLOCKED: styles.trustBlocked,
};

/**
 * Вердикт антифрода по отклику. По умолчанию «чисто» не показываем — плашка нужна,
 * только когда есть что сказать; showClean включает её везде (кабинет админа).
 */
export const FraudBadge = ({ status, score, showClean = false }) => {
  if (!status || (status === 'CLEAN' && !showClean)) return null;
  return (
    <span className={`${styles.badge} ${FRAUD_CLASS[status] || ''}`} title="Вердикт антифрода">
      {FRAUD_STATUS_LABELS[status] || status}
      {score != null && status !== 'CLEAN' ? ` · ${score}` : ''}
    </span>
  );
};

/** Репутация криатора: новичок, проверенный, ограничен, заблокирован. */
export const TrustBadge = ({ level }) => {
  if (!level) return null;
  return (
    <span className={`${styles.badge} ${TRUST_CLASS[level] || ''}`} title="Репутация криатора">
      {TRUST_LEVEL_LABELS[level] || level}
    </span>
  );
};

/** Сработавшие правила скоринга с пояснениями. */
export const FraudFlags = ({ flags }) => {
  if (!Array.isArray(flags) || flags.length === 0) return null;
  return (
    <ul className={styles.flags}>
      {flags.map((flag) => (
        <li key={flag.code} className={styles.flag}>
          <span className={styles.flagTitle}>
            {flag.title}
            {flag.points != null ? <span className={styles.flagPoints}> +{flag.points}</span> : null}
          </span>
          {flag.detail && <span className={styles.flagDetail}>{flag.detail}</span>}
        </li>
      ))}
    </ul>
  );
};

export default FraudBadge;
