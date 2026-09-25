import React from 'react';
import ui from '../../../shared/ui.module.css';
import styles from './Skeleton.module.css';

const Skeleton = ({ width, height, radius, block = false, className = '' }) => (
  <span
    className={[styles.skeleton, block ? styles.block : '', className].filter(Boolean).join(' ')}
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

export const SkeletonText = ({ lines = 3, lastWidth = '60%' }) =>
  Array.from({ length: lines }, (_, index) => (
    <span key={index} className={styles.line}>
      <Skeleton width={index === lines - 1 ? lastWidth : '100%'} />
    </span>
  ));

export const SkeletonPageHead = ({ eyebrow, title, titleWidth = '14ch', subtitle = true }) => (
  <header className={ui.pageHead}>
    <div className={ui.pageHeadMain}>
      {eyebrow && <span className={ui.eyebrow}>{eyebrow}</span>}
      <h1 className={ui.title}>{title || <Skeleton width={titleWidth} />}</h1>
      {subtitle && (
        <p className={ui.subtitle}>
          <Skeleton width="min(26rem, 80%)" />
        </p>
      )}
    </div>
  </header>
);

export const SkeletonTableRows = ({ columns, rows = 4 }) =>
  Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden="true">
      {columns.map((column, index) => (
        <td key={index} className={column.className}>
          <Skeleton width={column.width || '70%'} />
          {column.lines > 1 &&
            Array.from({ length: column.lines - 1 }, (_, line) => (
              <span key={line} className={styles.line}>
                <Skeleton width="55%" />
              </span>
            ))}
        </td>
      ))}
    </tr>
  ));

export default Skeleton;
