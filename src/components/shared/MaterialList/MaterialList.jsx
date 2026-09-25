import React from 'react';
import { formatFileSize } from '../../../shared/requirements';
import styles from './MaterialList.module.css';

const linkHost = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const MaterialList = ({ materials, onRemove, className = '' }) => {
  if (!Array.isArray(materials) || materials.length === 0) return null;

  return (
    <ul className={`${styles.list} ${className}`}>
      {materials.map((material, index) => {
        const isFile = material.kind === 'FILE';
        const meta = isFile ? formatFileSize(material.sizeBytes) : linkHost(material.url);
        const action = isFile && !material.opensInBrowser ? 'Скачать' : 'Открыть';
        return (
          <li key={`${material.fileKey || material.url || ''}-${index}`} className={styles.item}>
            <span className={`${styles.badge} ${isFile ? '' : styles.badgeLink}`}>
              {isFile ? 'Файл' : 'Ссылка'}
            </span>
            <span className={styles.body}>
              {material.url ? (
                <a
                  className={styles.title}
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  title={material.title}
                >
                  {material.title}
                </a>
              ) : (
                <span className={styles.title} title={material.title}>
                  {material.title}
                </span>
              )}
              {meta && <span className={styles.meta}>{meta}</span>}
            </span>
            {material.url && (
              <a className={styles.action} href={material.url} target="_blank" rel="noreferrer">
                {action}
              </a>
            )}
            {onRemove && (
              <button
                type="button"
                className={styles.remove}
                onClick={() => onRemove(index)}
                aria-label={`Убрать «${material.title}»`}
                title="Убрать"
              >
                ×
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MaterialList;
