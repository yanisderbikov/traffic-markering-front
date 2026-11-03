import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { axisLabel, bucketLabel, isOngoing, niceTicks } from './series';
import styles from './TimeChart.module.css';

const PAD_TOP = 10;
const AXIS_HEIGHT = 22;
const GUTTER_GAP = 8;
const BAR_MAX = 24;
const BAR_GAP = 2;
const TICK_FONT = '11px Manrope, -apple-system, BlinkMacSystemFont, sans-serif';

let measureContext;
const textWidth = (text) => {
  if (!measureContext) measureContext = document.createElement('canvas').getContext('2d');
  measureContext.font = TICK_FONT;
  return measureContext.measureText(text).width;
};

// Столбик со скруглённым «концом данных» и прямым углом у базовой линии.
const barPath = (x, y, width, height) => {
  const r = Math.min(4, width / 2, height);
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
};

const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

/**
 * Один ряд по шагам времени: kind="bar" — события за шаг, kind="line" — накопленная величина.
 * Наведение (или стрелки с клавиатуры) показывает подсказку с датой шага и значениями rows.
 */
const TimeChart = ({
  points,
  step,
  valueKey,
  kind = 'bar',
  height = 180,
  integer = false,
  formatTick,
  rows,
  label,
}) => {
  const [boxRef, width] = useWidth();
  const [active, setActive] = useState(null);

  const values = useMemo(() => points.map((point) => Number(point[valueKey]) || 0), [points, valueKey]);
  const ticks = useMemo(() => niceTicks(Math.max(...values, 0), 3, integer), [values, integer]);
  const top = ticks[ticks.length - 1];
  const gutter = useMemo(
    () => (width ? Math.ceil(Math.max(...ticks.map((t) => textWidth(formatTick(t))))) + GUTTER_GAP : 0),
    [ticks, formatTick, width]
  );

  const plotW = Math.max(0, width - gutter);
  const plotH = height - PAD_TOP - AXIS_HEIGHT;
  const n = points.length;
  const band = n ? plotW / n : 0;
  const yOf = (value) => PAD_TOP + plotH - (value / top) * plotH;
  const xOf = (index) => gutter + band * index + band / 2;

  // Подписи под осью — с ровным шагом от последней точки, чтобы «сегодня» всегда было подписано.
  const labelStride = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 96))));
  const labelIndexes = Array.from({ length: n }, (_, i) => i).filter((i) => (n - 1 - i) % labelStride === 0);
  const labelAnchor = (index) => {
    const half = textWidth(axisLabel(points[index], step)) / 2;
    if (xOf(index) - half < gutter) return { x: gutter, anchor: 'start' };
    if (xOf(index) + half > width) return { x: width, anchor: 'end' };
    return { x: xOf(index), anchor: 'middle' };
  };

  const pick = (clientX) => {
    const rect = boxRef.current.getBoundingClientRect();
    const index = Math.floor((clientX - rect.left - gutter) / band);
    setActive(index >= 0 && index < n ? index : null);
  };

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const delta = e.key === 'ArrowLeft' ? -1 : 1;
    setActive((prev) => Math.min(n - 1, Math.max(0, (prev ?? n - 1) + (prev == null ? 0 : delta))));
  };

  const barWidth = Math.max(1, Math.min(BAR_MAX, band - (band > 4 ? BAR_GAP : 0.5)));
  const line = kind === 'line' && n > 0
    ? values.map((v, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(v)}`).join('')
    : '';
  const area = line ? `${line}L${xOf(n - 1)},${yOf(0)}L${xOf(0)},${yOf(0)}Z` : '';

  const point = active != null ? points[active] : null;
  const tipLeft = active != null ? xOf(active) : 0;
  const tipFlip = tipLeft > width / 2;

  return (
    <div ref={boxRef} className={styles.box} style={{ height }}>
      {width > 0 && (
        <svg
          className={styles.svg}
          width={width}
          height={height}
          role="img"
          aria-label={label}
          tabIndex={0}
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((prev) => prev ?? n - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line className={styles.grid} x1={gutter} x2={width} y1={yOf(tick)} y2={yOf(tick)} />
              <text className={styles.tick} x={gutter - GUTTER_GAP} y={yOf(tick)} dy="0.32em" textAnchor="end">
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {labelIndexes.map((index) => {
            const { x, anchor } = labelAnchor(index);
            return (
              <text key={index} className={styles.tick} x={x} y={height - 6} textAnchor={anchor}>
                {axisLabel(points[index], step)}
              </text>
            );
          })}

          {active != null && kind === 'line' && (
            <line className={styles.crosshair} x1={xOf(active)} x2={xOf(active)} y1={PAD_TOP} y2={PAD_TOP + plotH} />
          )}

          {kind === 'bar' &&
            values.map((value, i) =>
              value > 0 ? (
                <path
                  key={points[i].start}
                  className={`${styles.bar} ${active != null && active !== i ? styles.dim : ''}`}
                  d={barPath(xOf(i) - barWidth / 2, yOf(value), barWidth, yOf(0) - yOf(value))}
                />
              ) : null
            )}

          {kind === 'line' && (
            <>
              <path className={styles.area} d={area} />
              <path className={styles.line} d={line} />
              {n > 0 && <circle className={styles.dot} cx={xOf(n - 1)} cy={yOf(values[n - 1])} r={4} />}
              {active != null && <circle className={styles.dot} cx={xOf(active)} cy={yOf(values[active])} r={4} />}
            </>
          )}

          <line className={styles.baseline} x1={gutter} x2={width} y1={yOf(0)} y2={yOf(0)} />
        </svg>
      )}

      {point && (
        <div
          className={styles.tip}
          style={{
            left: tipFlip ? undefined : tipLeft + 12,
            right: tipFlip ? width - tipLeft + 12 : undefined,
          }}
          role="status"
        >
          <span className={styles.tipDate}>
            {bucketLabel(point, step)}
            {isOngoing(point) && ' · идёт сейчас'}
          </span>
          {rows.map((row) => (
            <span key={row.label} className={styles.tipRow}>
              <span className={styles.tipValue}>{row.format(point)}</span>
              <span className={styles.tipLabel}>{row.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeChart;
