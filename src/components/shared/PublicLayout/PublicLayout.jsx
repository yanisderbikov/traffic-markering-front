import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import apiClient from '../../../apiClient';
import Logo from '../Logo/Logo';
import Icon from '../Icon/Icon';
import styles from './PublicLayout.module.css';

const NAV = [
  { to: '/#brands', label: 'Рекламодателям' },
  { to: '/#creators', label: 'Креаторам' },
  { to: '/info', label: 'Как это работает' },
];

const YEAR = new Date().getFullYear();

const PublicLayout = ({ children, wide = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const authorized = apiClient.hasLiveToken();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const isActive = (to) => {
    if (to.startsWith('/#')) return location.pathname === '/' && location.hash === to.slice(1);
    return location.pathname.startsWith(to);
  };

  const links = NAV.map((item) => (
    <a
      key={item.to}
      href={item.to}
      className={`${styles.navLink} ${isActive(item.to) ? styles.navLinkActive : ''}`}
    >
      {item.label}
    </a>
  ));

  const actions = authorized ? (
    <Link to="/app" className={styles.primary}>
      В кабинет
    </Link>
  ) : (
    <>
      <Link to="/login" className={styles.secondary}>
        Войти
      </Link>
      <Link to="/register" className={styles.primary}>
        Начать
      </Link>
    </>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} ${wide ? styles.wide : ''}`}>
          <Link to="/" className={styles.brand} aria-label="offer">
            <Logo withText />
          </Link>
          <nav className={styles.nav} aria-label="Разделы сайта">
            {links}
          </nav>
          <div className={styles.actions}>{actions}</div>
          <button
            type="button"
            className={styles.burger}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {links}
            <div className={styles.mobileActions}>{actions}</div>
          </div>
        )}
      </header>

      <main className={`${styles.main} ${wide ? styles.wide : ''}`}>{children}</main>

      <footer className={styles.footer}>
        <div className={`${styles.footerInner} ${wide ? styles.wide : ''}`}>
          <Logo withText className={styles.footerLogo} />
          <span className={styles.tagline}>Контент. Охват. Результат.</span>
          <nav className={styles.footerNav} aria-label="Документы">
            <NavLink to="/info" className={styles.footerLink}>
              О сервисе
            </NavLink>
            <NavLink to="/info/privacy" className={styles.footerLink}>
              Конфиденциальность
            </NavLink>
            <NavLink to="/info/terms" className={styles.footerLink}>
              Условия
            </NavLink>
          </nav>
          <span className={styles.copy}>© Offer, {YEAR}</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
