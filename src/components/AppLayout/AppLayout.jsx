import React, { useState, useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import Icon from '../shared/Icon/Icon';
import { SECTIONS, getAllowedSections, sectionForPath } from '../../permissions';
import { ROLE_LABELS } from '../../shared/dictionaries';
import { CONTACT_EMAIL } from '../Info/legal';
import styles from './AppLayout.module.css';

const MENU = [
  { to: '/app', label: 'Обзор', short: 'Обзор', icon: 'chart', end: true },
  { to: '/app/board', label: 'Офферы', short: 'Офферы', icon: 'grid', section: SECTIONS.APPLICATIONS },
  { to: '/app/campaigns', label: 'Мои кампании', short: 'Кампании', icon: 'briefcase', section: SECTIONS.CAMPAIGNS },
  { to: '/app/applications', label: 'Мои работы', short: 'Работы', icon: 'briefcase', section: SECTIONS.APPLICATIONS },
  { to: '/app/wallet', label: 'Финансы', short: 'Финансы', icon: 'wallet', section: SECTIONS.WALLET },
  { to: '/app/earnings', label: 'Финансы', short: 'Финансы', icon: 'wallet', section: SECTIONS.EARNINGS },
  { to: '/app/finance', label: 'Кошельки заказчиков', short: 'Кошельки', icon: 'wallet', section: SECTIONS.FINANCE, end: true },
  { to: '/app/finance/payouts', label: 'Выплаты', short: 'Выплаты', icon: 'download', section: SECTIONS.FINANCE },
  { to: '/app/finance/operations', label: 'Все операции', short: 'Операции', icon: 'chart', section: SECTIONS.FINANCE },
  { to: '/app/admin/fraud', label: 'Антифрод', short: 'Антифрод', icon: 'shield', section: SECTIONS.FRAUD, end: true },
  { to: '/app/admin/fraud/creators', label: 'Репутация креаторов', short: 'Репутация', icon: 'users', section: SECTIONS.FRAUD },
  { to: '/app/admin/users', label: 'Пользователи', short: 'Люди', icon: 'users', section: SECTIONS.USERS },
  { to: '/app/profile', label: 'Профиль', short: 'Профиль', icon: 'user', section: SECTIONS.PROFILE, end: true },
  { to: '/app/profile/socials', label: 'Соцсети', short: 'Соцсети', icon: 'link', section: SECTIONS.SOCIALS },
];

const TAB_LIMIT = 4;

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  const userName = jwtMeta?.name || jwtMeta?.username || '';
  const roleLabel = ROLE_LABELS[role] || role || '';
  const allowedSections = getAllowedSections(role);
  const visibleMenu = MENU.filter(
    (item) => !item.section || allowedSections.includes(item.section)
  );
  const tabs = visibleMenu.slice(0, TAB_LIMIT);

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

  const currentSection = sectionForPath(location.pathname);
  if (role && currentSection && !allowedSections.includes(currentSection)) {
    return <Navigate to="/app" replace />;
  }

  const initial = userName.trim().charAt(0).toUpperCase() || '·';

  const navList = (
    <nav className={styles.nav} aria-label="Разделы кабинета">
      {visibleMenu.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end ?? false}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          <Icon name={item.icon} className={styles.navIcon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className={styles.sidebarFooter}>
      <a className={styles.help} href={`mailto:${CONTACT_EMAIL}`}>
        <span className={styles.helpTitle}>Нужна помощь?</span>
        <span className={styles.helpText}>Напишите команде Offer</span>
      </a>
      <div className={styles.user}>
        <NavLink to="/app/profile" className={styles.userLink} title={userName}>
          <span className={styles.userAvatar} aria-hidden="true">
            {initial}
          </span>
          <span className={styles.userText}>
            <span className={styles.userName}>{userName || 'Профиль'}</span>
            <span className={styles.userRole}>Личный кабинет</span>
          </span>
        </NavLink>
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
          <Logo light withText />
        </NavLink>
        {roleLabel && <span className={styles.rolePill}>{roleLabel}</span>}
        {navList}
        {sidebarFooter}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <NavLink to="/app" className={styles.topbarBrand} aria-label="offer">
            <Logo light withText />
          </NavLink>
          <span className={styles.breadcrumb}>
            Рабочее пространство{roleLabel ? ` / ${roleLabel}` : ''}
          </span>
          <div className={styles.topbarActions}>
            <NavLink to="/app/profile" className={styles.topbarAvatar} title={userName}>
              {initial}
            </NavLink>
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

        <main className={styles.content}>
          <Outlet />
        </main>
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
        {tabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <Icon name={item.icon} size={22} />
            <span>{item.short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
