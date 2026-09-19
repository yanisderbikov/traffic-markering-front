import React, { Children, cloneElement, isValidElement } from 'react';
import styles from './Field.module.css';

// Типы, у которых браузер всегда что-то рисует внутри (дату, «выберите файл»),
// поэтому подпись сразу стоит на рамке — иначе она наложится на это содержимое.
const ALWAYS_FILLED_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week', 'file', 'color']);

/**
 * Поле формы с «плавающей» подписью. Пока поле пустое, подпись лежит внутри рамки
 * вместо плейсхолдера; при фокусе или введённом значении уменьшается и уезжает
 * на верхнюю границу рамки — так поле не требует отдельной строки под подпись.
 *
 * Первый ребёнок — сам контрол (input / textarea / select), остальные дети
 * (FieldError, подсказки) рисуются под ним.
 */
export default function Field({ label, className = '', pill = false, children }) {
  const [control, ...rest] = Children.toArray(children);
  if (!isValidElement(control)) return null;

  const isSelect = control.type === 'select';
  const isTextarea = control.type === 'textarea';
  const alwaysFilled = isSelect || ALWAYS_FILLED_TYPES.has(control.props.type);
  // Плейсхолдер не показываем — подписи на рамке достаточно. Пробел нужен только
  // чтобы работал :placeholder-shown, по которому CSS понимает, что поле пустое.
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
