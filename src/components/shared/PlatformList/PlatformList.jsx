import React from 'react';
import SocialIcon from '../SocialIcon/SocialIcon';
import { PLATFORM_LABELS } from '../../../shared/dictionaries';
import styles from './PlatformList.module.css';

const PlatformList = ({ platforms, compact = false, className = '' }) => {
  if (!Array.isArray(platforms) || platforms.length === 0) return null;

  return (
    <ul className={`${styles.list} ${compact ? styles.compact : ''} ${className}`}>
      {platforms.map((platform) => {
        const label = PLATFORM_LABELS[platform] || platform;
        return (
          <li key={platform} className={styles.item} title={label} aria-label={label}>
            <SocialIcon name={platform} className={styles.icon} />
            {!compact && <span>{label}</span>}
          </li>
        );
      })}
    </ul>
  );
};

export default PlatformList;
