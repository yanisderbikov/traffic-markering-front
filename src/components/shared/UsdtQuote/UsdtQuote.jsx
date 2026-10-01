import React from 'react';
import useUsdtRate from '../../../shared/useUsdtRate';
import { formatRate, formatUsdt, kopecksToUsdt } from '../../../shared/money';
import Skeleton from '../Skeleton/Skeleton';
import styles from './UsdtQuote.module.css';

const RAPIRA_URL = 'https://rapira.net';

const TIME_FORMATTER = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

const rapiraLink = (
  <a href={RAPIRA_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
    Rapira
  </a>
);

const Quote = ({ label, className, value, note }) => (
  <div className={[styles.quote, className].filter(Boolean).join(' ')} aria-live="polite">
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
    <span className={styles.note}>{note}</span>
  </div>
);

// Заявка уже создана: курс сохранён в ней и больше не меняется
const FixedQuote = ({ kopecks, rate, label, className }) => (
  <Quote
    label={label}
    className={className}
    value={formatUsdt(kopecks ? kopecksToUsdt(kopecks, rate) : null)}
    note={
      <>
        Курс {rapiraLink} зафиксирован при создании заявки: 1 USDT = {formatRate(rate)}.
      </>
    }
  />
);

// Заявки ещё нет: показываем текущий курс, он зафиксируется в момент создания
const LiveQuote = ({ kopecks, label, className }) => {
  const { rate, error } = useUsdtRate();
  const rubPerUsdt = Number(rate?.askPrice) || null;
  const usdt = kopecks ? kopecksToUsdt(kopecks, rubPerUsdt) : null;

  return (
    <Quote
      label={label}
      className={className}
      value={!rate && !error ? <Skeleton width="9ch" /> : formatUsdt(usdt)}
      note={
        rubPerUsdt ? (
          <>
            Курс {rapiraLink}: 1 USDT = {formatRate(rubPerUsdt)}
            {rate.fetchedAt ? ` · на ${TIME_FORMATTER.format(new Date(rate.fetchedAt))}` : ''}.
          </>
        ) : (
          error || 'Загружаем курс Rapira…'
        )
      }
    />
  );
};

const UsdtQuote = ({ kopecks, fixedRate, label = 'К переводу', className = '' }) => {
  const rate = Number(fixedRate) || null;
  return rate ? (
    <FixedQuote kopecks={kopecks} rate={rate} label={label} className={className} />
  ) : (
    <LiveQuote kopecks={kopecks} label={label} className={className} />
  );
};

export default UsdtQuote;
