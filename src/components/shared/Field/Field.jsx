import React, { Children, cloneElement, isValidElement } from 'react';
import styles from './Field.module.css';

const ALWAYS_FILLED_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week', 'file', 'color']);

export default function Field({ label, className = '', pill = false, children }) {
  const [control, ...rest] = Children.toArray(children);
  if (!isValidElement(control)) return null;

  const isSelect = control.type === 'select';
  const isTextarea = control.type === 'textarea';
  const alwaysFilled = isSelect || ALWAYS_FILLED_TYPES.has(control.props.type);
  const element = isSelect ? control : cloneElement(control, { placeholder: ' ' });

  const frameClass = [
    styles.frame,
    isTextarea ? styles.frameArea : '',
    alwaysFilled ? styles.frameFilled : '',
    pill ? styles.framePill : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={`${styles.field} ${className}`.trim()}>
      <span className={frameClass}>
        {element}
        <span className={styles.label}>{label}</span>
      </span>
      {rest}
    </label>
  );
}
