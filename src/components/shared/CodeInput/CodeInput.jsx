import React, { useEffect, useRef } from 'react';
import styles from './CodeInput.module.css';

export const CODE_LENGTH = 6;

const CodeInput = ({ value, onChange, disabled = false, invalid = false, autoFocus = false }) => {
  const refs = useRef([]);
  const digits = String(value || '').replace(/\D/g, '').slice(0, CODE_LENGTH);

  useEffect(() => {
    if (!autoFocus) return;
    refs.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus();
  }, [autoFocus]);

  const focusCell = (index) => {
    refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();
  };

  const setDigits = (next) => {
    onChange(next.slice(0, CODE_LENGTH));
  };

  const handleInput = (index, raw) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) return;
    const next = (digits.slice(0, index) + clean + digits.slice(index + clean.length)).slice(
      0,
      CODE_LENGTH
    );
    setDigits(next);
    focusCell(index + clean.length);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        setDigits(digits.slice(0, index) + digits.slice(index + 1));
      } else if (index > 0) {
        setDigits(digits.slice(0, index - 1) + digits.slice(index));
        focusCell(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    setDigits(text);
    focusCell(text.length);
  };

  const activeIndex = Math.min(digits.length, CODE_LENGTH - 1);

  return (
    <div className={styles.cells} onPaste={handlePaste}>
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={CODE_LENGTH}
          value={digits[index] || ''}
          placeholder="•"
          className={`${styles.cell} ${index === activeIndex && !digits[index] ? styles.cellActive : ''}`}
          aria-label={`Цифра ${index + 1} из ${CODE_LENGTH}`}
          aria-invalid={invalid ? 'true' : undefined}
          disabled={disabled}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};

export default CodeInput;
