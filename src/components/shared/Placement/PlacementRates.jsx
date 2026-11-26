import React from 'react';
import { formatRubles } from '../../../shared/money';
import { rateVariants } from '../../../shared/placement';
import styles from './Placement.module.css';

/**
 * Четыре варианта участия «ссылка и промокод» со ставками за 1 000 просмотров.
 * С onSelect варианты кликабельны (выбор криатора), без него — просто список ставок.
 */
const PlacementRates = ({ rates, selected, onSelect, disabled = false }) => {
  const variants = rateVariants(rates);
  return (
    <ul className={styles.variants} role={onSelect ? 'radiogroup' : undefined}>
      {variants.map((variant) => {
        const active = selected === variant.key;
        const content = (
          <>
            <span className={styles.variantLabel}>
              {onSelect && <span className={styles.variantDot} aria-hidden="true" />}
              {variant.label}
            </span>
            <span className={styles.variantRate}>
              {formatRubles(variant.rate)}
              <span className={styles.variantShare}>{variant.share}%</span>
            </span>
          </>
        );
        return (
          <li key={variant.key}>
            {onSelect ? (
              <button
                type="button"
                role="radio"
                aria-checked={active}
                className={active ? styles.variantActive : styles.variant}
                onClick={() => onSelect(variant)}
                disabled={disabled}
              >
                {content}
              </button>
            ) : (
              <div className={styles.variant}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export const variantKey = (withLink, withPromo) =>
  withLink && withPromo ? 'full' : withLink ? 'link' : withPromo ? 'promo' : 'base';

export default PlacementRates;
