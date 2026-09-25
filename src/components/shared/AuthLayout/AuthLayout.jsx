import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import styles from './AuthLayout.module.css';

const AuthLayout = ({ title, caption, children, footer }) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="На главную">
        <Logo withText />
      </Link>
    </header>
    <main className={styles.main}>
      <div className={styles.box}>
        <h1 className={styles.title}>{title}</h1>
        {caption && <p className={styles.caption}>{caption}</p>}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
        <p className={styles.legal}>
          Продолжая, вы соглашаетесь с{' '}
          <Link to="/info/terms" className={styles.legalLink}>
            условиями сервиса
          </Link>{' '}
          и{' '}
          <Link to="/info/privacy" className={styles.legalLink}>
            политикой конфиденциальности
          </Link>
          .
        </p>
      </div>
    </main>
  </div>
);

export default AuthLayout;
