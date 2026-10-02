import React from 'react';
import Icon from '../shared/Icon/Icon';
import { THEME_OPTIONS, setThemePreference, useThemePreference } from '../../shared/theme';
import ui from '../../shared/ui.module.css';
import styles from './ThemeSettings.module.css';

const ThemeSettings = ({ children }) => {
  const preference = useThemePreference();

  return (
    <section className={`${ui.page} ${styles.page}`}>
      <div className={`${ui.card} ${styles.card}`}>
        <h2 className={ui.cardTitle}>Тема оформления</h2>
        <div className={ui.chips} role="group" aria-label="Тема оформления">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={preference === option.value ? ui.chipActive : ui.chip}
              onClick={() => setThemePreference(option.value)}
              aria-pressed={preference === option.value}
            >
              <Icon name={option.icon} size={16} />
              {option.label}
            </button>
          ))}
        </div>
        <p className={`${ui.hint} ${styles.note}`}>
          «Авто» повторяет тему телефона или компьютера. Выбор сохраняется в этом браузере.
        </p>
      </div>
      {children}
    </section>
  );
};

export default ThemeSettings;
