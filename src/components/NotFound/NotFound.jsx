import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../shared/Logo/Logo';
import ui from '../../shared/ui.module.css';
import styles from './NotFound.module.css';

const NotFound = () => (
  <div className={styles.page}>
    <Link to="/" className={styles.brand} aria-label="offer">
      <Logo withText />
    </Link>
    <main className={styles.body}>
      <p className={styles.code}>404</p>
      <h1 className={ui.title}>Страница не найдена</h1>
      <p className={styles.text}>
        Возможно, ссылка устарела или оффер сняли с публикации. Вернитесь на главную — там всё
        актуальное.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={ui.btnPrimary}>
          На главную
        </Link>
        <Link to="/app" className={ui.btnSecondary}>
          В кабинет
        </Link>
      </div>
    </main>
  </div>
);

export default NotFound;
