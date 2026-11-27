import React from 'react';
import FieldError from '../FieldError/FieldError';
import { formatRubles } from '../../../shared/money';
import { contentRatesOf } from '../../../shared/contentRates';
import ui from '../../../shared/ui.module.css';
import styles from './ContentTopicPicker.module.css';

/** Выбор тематики ролика при подаче: от неё зависит ставка, по которой ролик оплачивается. */
const ContentTopicPicker = ({ campaign, value, onChange, disabled, error, extraKopecks = 0 }) => {
  const rates = contentRatesOf(campaign);
  if (rates.length === 0) return null;

  return (
    <div className={styles.field}>
      <span className={ui.label} id="content-topic-label">
        Тематика ролика *
      </span>
      <div className={styles.options} role="radiogroup" aria-labelledby="content-topic-label">
        {rates.map((rate) => {
          const selected = value === rate.name;
          return (
            <button
              key={rate.name}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? `${styles.option} ${styles.optionActive}` : styles.option}
              onClick={() => onChange(rate.name)}
              disabled={disabled}
            >
              <span className={styles.name}>{rate.name}</span>
              <span className={styles.rate}>
                {formatRubles(rate.ratePerThousandKopecks + extraKopecks)} / 1 000
              </span>
            </button>
          );
        })}
      </div>
      <FieldError>{error}</FieldError>
      <span className={ui.hint}>
        Выберите, о чём ваш ролик: ставка у каждой тематики своя. Если ролик не подходит под
        выбранную тематику, заказчик может его отклонить.
      </span>
    </div>
  );
};

export default ContentTopicPicker;
