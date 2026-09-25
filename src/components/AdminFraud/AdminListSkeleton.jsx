import React from 'react';
import Skeleton from '../shared/Skeleton/Skeleton';
import styles from './AdminFraud.module.css';

const AdminListSkeleton = ({ items = 3, meta = true }) => (
  <ul className={styles.list} aria-busy="true">
    {Array.from({ length: items }, (_, index) => (
      <li key={index} className={styles.item}>
        <div className={styles.itemHead}>
          <div className={styles.who}>
            <span className={styles.name}>
              <Skeleton width="9rem" />
            </span>
            <span className={styles.email}>
              <Skeleton width="12rem" />
            </span>
          </div>
          <div className={styles.badges}>
            <Skeleton width="7rem" height={30} radius="999px" />
            <Skeleton width="9rem" height={40} radius="var(--field-radius)" />
          </div>
        </div>
        {meta && (
          <p className={styles.meta}>
            <Skeleton width="min(30rem, 90%)" />
          </p>
        )}
        <p className={styles.numbers}>
          <Skeleton width="min(26rem, 80%)" />
        </p>
      </li>
    ))}
  </ul>
);

export default AdminListSkeleton;
