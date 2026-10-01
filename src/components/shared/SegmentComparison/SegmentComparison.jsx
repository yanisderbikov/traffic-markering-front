import React, { useEffect, useState } from 'react';
import apiClient from '../../../apiClient';
import Skeleton from '../Skeleton/Skeleton';
import { formatRubles } from '../../../shared/money';
import { pluralize } from '../../../shared/requirements';
import { MEDIAN_TOLERANCE_PERCENT } from '../../CampaignEditor/campaignForm';
import ui from '../../../shared/ui.module.css';
import styles from './SegmentComparison.module.css';

const PERCENT_FORMATTER = new Intl.NumberFormat('ru-RU');

const formatPercent = (percent) =>
  `${percent > 0 ? '+' : percent < 0 ? '−' : ''}${PERCENT_FORMATTER.format(Math.abs(percent))}%`;

// Порог «на уровне» тот же, что в мастере: ±5% от медианы — не повод красить в цвет
const toneOf = (percent) => {
  if (percent == null) return null;
  if (percent > MEDIAN_TOLERANCE_PERCENT) return 'above';
  if (percent < -MEDIAN_TOLERANCE_PERCENT) return 'below';
  return 'even';
};

const TONE_CLASS = { above: styles.above, below: styles.below, even: '' };

const METRICS = [
  { key: 'rate', label: 'Ставка за 1 000 просмотров', more: 'выше', less: 'ниже' },
  { key: 'budget', label: 'Бюджет', more: 'больше', less: 'меньше' },
];

const headline = (metric, percent, base) => {
  const tone = toneOf(percent);
  if (tone === 'even') return `На уровне ${base}`;
  const word = tone === 'above' ? metric.more : metric.less;
  return `На ${PERCENT_FORMATTER.format(Math.abs(percent))}% ${word} ${base}`;
};

const MetricRow = ({ metric, data }) => {
  const tone = toneOf(data.diffPercent);
  const position = data.higherThanPercent;
  return (
    <div className={`${styles.metric} ${TONE_CLASS[tone] || ''}`}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>{metric.label}</span>
        {tone && <span className={styles.percent}>{formatPercent(data.diffPercent)}</span>}
      </div>
      {tone && <p className={styles.headline}>{headline(metric, data.diffPercent, 'медианы сегмента')}</p>}
      {position != null && (
        <div
          className={styles.scale}
          role="img"
          aria-label={`${metric.more}, чем у ${position}% объявлений сегмента`}
        >
          <span className={styles.medianTick} aria-hidden="true" />
          {/* Позиция точки — единственное, что нельзя вынести в CSS-модуль */}
          <span className={styles.dot} style={{ left: `${position}%` }} aria-hidden="true" />
        </div>
      )}
      <p className={styles.note}>
        {data.kopecks != null && (
          <>
            у объявления <b className={styles.value}>{formatRubles(data.kopecks)}</b>
            {' · '}
          </>
        )}
        медиана <b className={styles.value}>{formatRubles(data.medianKopecks)}</b>
        {position > 0 && ` · ${metric.more}, чем у ${position}% объявлений`}
      </p>
    </div>
  );
};

const MarketRateRow = ({ segment }) => {
  const tone = toneOf(segment.marketRateDiffPercent);
  return (
    <div className={`${styles.metric} ${TONE_CLASS[tone] || ''}`}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>Средняя ставка по рынку в тематике</span>
        {tone && <span className={styles.percent}>{formatPercent(segment.marketRateDiffPercent)}</span>}
      </div>
      {tone && (
        <p className={styles.headline}>
          {headline(METRICS[0], segment.marketRateDiffPercent, 'средней по рынку')}
        </p>
      )}
      <p className={styles.note}>
        <b className={styles.value}>{formatRubles(segment.marketRatePerThousandKopecks)}</b> за 1 000
        просмотров
      </p>
    </div>
  );
};

const SegmentSkeleton = ({ className }) => (
  <section className={`${ui.card} ${className}`} aria-busy="true">
    <span className={ui.eyebrow}>Сравнение с сегментом</span>
    <p className={styles.title}>
      <Skeleton width="12ch" />
    </p>
    <p className={styles.subtitle}>
      <Skeleton width="min(18rem, 80%)" />
    </p>
    <div className={styles.metrics}>
      {METRICS.map((metric) => (
        <div key={metric.key} className={styles.metric}>
          <span className={styles.metricLabel}>{metric.label}</span>
          <Skeleton block height={6} radius={3} />
          <Skeleton width="70%" />
        </div>
      ))}
    </div>
  </section>
);

/**
 * Объявление среди других запущенных объявлений своей тематики: на сколько ставка и бюджет
 * выше или ниже медианы и у какой доли объявлений они меньше. Считает бэк; пока соседей
 * мало, честно говорим об этом и показываем только среднюю рыночную ставку по тематике.
 *
 * owner — смотрит заказчик: при ставке ниже сегмента подсказываем, что её можно поднять.
 */
const SegmentComparison = ({ publicId, owner = false, className = '' }) => {
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicId) return undefined;
    let alive = true;
    setLoading(true);
    apiClient.api
      .boardCampaignSegment(publicId)
      .then((res) => alive && setSegment(res.data))
      .catch(() => alive && setSegment(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [publicId]);

  if (loading) return <SegmentSkeleton className={className} />;
  // Без тематики нет и сегмента; ошибку тоже не показываем — блок вспомогательный
  if (!segment?.topic) return null;

  const count = segment.campaignsCount ?? 0;
  const rateBelow = segment.comparable && toneOf(segment.rate?.diffPercent) === 'below';

  return (
    <section className={`${ui.card} ${className}`}>
      <span className={ui.eyebrow}>Сравнение с сегментом</span>
      <p className={styles.title}>{segment.topicDescription}</p>
      {segment.comparable ? (
        <>
          <p className={styles.subtitle}>
            Среди {count}{' '}
            {pluralize(count, [
              'другого запущенного объявления',
              'других запущенных объявлений',
              'других запущенных объявлений',
            ])}{' '}
            этой тематики
          </p>
          <div className={styles.metrics}>
            {METRICS.map((metric) => (
              <MetricRow key={metric.key} metric={metric} data={segment[metric.key] || {}} />
            ))}
          </div>
          {owner && rateBelow && (
            <p className={ui.hintWarn}>
              Креаторы чаще берут офферы со ставкой не ниже, чем у соседей по тематике, — её можно
              поднять в «Изменить объявление».
            </p>
          )}
        </>
      ) : (
        <>
          <p className={styles.subtitle}>
            {count > 0
              ? `В тематике пока ${count} ${pluralize(count, [
                  'другое запущенное объявление',
                  'других запущенных объявления',
                  'других запущенных объявлений',
                ])}`
              : 'В тематике пока нет других запущенных объявлений'}
            {` — сравним ставку и бюджет, когда их станет хотя бы ${segment.minCampaignsCount}.`}
          </p>
          {segment.marketRatePerThousandKopecks != null && (
            <div className={styles.metrics}>
              <MarketRateRow segment={segment} />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default SegmentComparison;
