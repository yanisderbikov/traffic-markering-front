import React, { useState, useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import Icon from '../shared/Icon/Icon';
import Skeleton, { SkeletonPageHead, SkeletonText } from '../shared/Skeleton/Skeleton';
import ThemeSwitch from '../shared/ThemeSwitch/ThemeSwitch';
import { useSession } from '../../shared/session';
import { errorMessage } from '../../shared/auth';
import { ROLE_LABELS } from '../../shared/dictionaries';
import { CONTACT_EMAIL } from '../Info/legal';
import ui from '../../shared/ui.module.css';
import styles from './AppLayout.module.css';

const TAB_LIMIT = 4;
const NAV_PLACEHOLDERS = 5;

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();

  const account = session.user || apiClient.getJwtMetadata();
  const role = account?.role;
  const userName = account?.name || account?.username || '';
  const roleLabel = ROLE_LABELS[role] || role || '';
  const profileTab = session.tabs.find((tab) => tab.key === 'PROFILE');
  const quickTabs = session.tabs.slice(0, TAB_LIMIT);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    apiClient.clearToken();
    navigate('/login', { replace: true });
  };

  if (!apiClient.hasLiveToken()) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  const initial = userName.trim().charAt(0).toUpperCase() || '·';

  const navList = (
    <nav
      className={styles.nav}
      aria-label="Разделы кабинета"
      aria-busy={session.status === 'loading' || undefined}
    >
      {session.status === 'loading'
        ? Array.from({ length: NAV_PLACEHOLDERS }, (_, index) => (
            <Skeleton key={index} block height={46} radius={12} />
          ))
        : session.tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.path}
              end={tab.exact}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <Icon name={tab.icon} className={styles.navIcon} />
              <span>{tab.label}</span>
            </NavLink>
          ))}
    </nav>
  );

  const userCard = (
    <>
      <span className={styles.userAvatar} aria-hidden="true">
        {initial}
      </span>
      <span className={styles.userText}>
        <span className={styles.userName}>{userName || 'Профиль'}</span>
        <span className={styles.userRole}>Личный кабинет</span>
      </span>
    </>
  );

  const content =
    session.status === 'ready' ? (
      <Outlet />
    ) : session.status === 'error' ? (
      <div className={ui.page}>
        <p className={ui.errorBanner}>
          {errorMessage(session.error, 'Не удалось загрузить разделы кабинета')}
        </p>
        <button type="button" className={ui.btnPrimary} onClick={session.reload}>
          Попробовать ещё раз
        </button>
      </div>
    ) : (
      <div className={ui.page} aria-busy="true">
        <SkeletonPageHead />
        <SkeletonText lines={4} />
      </div>
    );

  const sidebarFooter = (
    <div className={styles.sidebarFooter}>
      <ThemeSwitch className={styles.themeSwitch} />
      <a className={styles.help} href={`mailto:${CONTACT_EMAIL}`}>
        <span className={styles.helpTitle}>Нужна помощь?</span>
        <span className={styles.helpText}>Напишите команде Offer</span>
      </a>
      <div className={styles.user}>
        {profileTab ? (
          <NavLink to={profileTab.path} className={styles.userLink} title={userName}>
            {userCard}
          </NavLink>
        ) : (
          <span className={styles.userLink} title={userName}>
            {userCard}
          </span>
        )}
        <button
          type="button"
          className={styles.logout}
          onClick={handleLogout}
          title="Выйти"
          aria-label="Выйти"
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <NavLink to="/app" className={styles.brand} aria-label="offer">
          <Logo withText />
        </NavLink>
        {roleLabel && <span className={styles.rolePill}>{roleLabel}</span>}
        {navList}
        {sidebarFooter}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <NavLink to="/app" className={styles.topbarBrand} aria-label="offer">
            <Logo withText />
          </NavLink>
          <span className={styles.breadcrumb}>
            Рабочее пространство{roleLabel ? ` / ${roleLabel}` : ''}
          </span>
          <div className={styles.topbarActions}>
            {profileTab && (
              <NavLink to={profileTab.path} className={styles.topbarAvatar} title={userName}>
                {initial}
              </NavLink>
            )}
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
        </header>

        <main className={styles.content}>{content}</main>
      </div>

      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropOpen : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        {roleLabel && <span className={styles.rolePill}>{roleLabel}</span>}
        {navList}
        {sidebarFooter}
      </aside>

      <nav className={styles.tabbar} aria-label="Быстрые разделы">
        {quickTabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <Icon name={tab.icon} size={22} />
            <span>{tab.shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
