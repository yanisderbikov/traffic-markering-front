import React, { useEffect, useRef, useState } from 'react';
import Icon from '../Icon/Icon';
import { THEME_OPTIONS, setThemePreference, useThemePreference } from '../../../shared/theme';
import styles from './ThemeSwitch.module.css';

const ThemeSwitch = ({ className = '' }) => {
  const preference = useThemePreference();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = THEME_OPTIONS.find((option) => option.value === preference) || THEME_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const choose = (value) => {
    setThemePreference(value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Тема оформления: ${current.label}`}
        title="Тема оформления"
      >
        <Icon name={current.icon} size={18} />
        <Icon name="chevronDown" size={14} className={styles.chevron} />
      </button>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Тема оформления">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={preference === option.value}
              className={`${styles.option} ${preference === option.value ? styles.optionActive : ''}`}
              onClick={() => choose(option.value)}
            >
              <Icon name={option.icon} size={16} />
              <span>{option.label}</span>
              {preference === option.value && (
                <Icon name="check" size={14} className={styles.check} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitch;
