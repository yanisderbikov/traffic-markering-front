import React, { useLayoutEffect, useRef, useState } from 'react';
import { formatRubles, formatRublesCompact } from '../../../shared/money';
import styles from './FitRubles.module.css';

const FitRubles = ({ kopecks, className = '' }) => {
  const boxRef = useRef(null);
  const probeRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const full = formatRubles(kopecks);
  const shown = compact ? formatRublesCompact(kopecks) : full;

  useLayoutEffect(() => {
    const box = boxRef.current;
    const probe = probeRef.current;
    const measure = () => setCompact(probe.offsetWidth > box.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(probe);
    return () => observer.disconnect();
  }, [full]);

  return (
    <span
      ref={boxRef}
      className={`${styles.box} ${className}`}
      title={shown === full ? undefined : full}
    >
      <span ref={probeRef} className={styles.probe} aria-hidden="true">
        {full}
      </span>
      {shown}
    </span>
  );
};

export default FitRubles;
