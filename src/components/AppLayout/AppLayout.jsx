import React, { useState, useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import { SECTIONS, getAllowedSections, sectionForPath } from '../../permissions';
import { ROLE_LABELS } from '../../shared/dictionaries';
import styles from './AppLayout.module.css';

// Меню кабинета. Группа показывается, только если её секция разрешена роли
// (см. permissions.js) — заказчик не видит отклики, криатор не видит объявления.
const MENU = [
  {
    title: 'объявления',
    section: SECTIONS.CAMPAIGNS,
    items: [
      { to: '/app/campaigns', label: 'Мои объявления' },
      { to: '/app/campaigns/new', label: 'Новое объявление' },
    ],
  },
  {
    title: 'работа',
    section: SECTIONS.APPLICATIONS,
    items: [
      { to: '/app/applications', label: 'Мои отклики' },
      { to: '/app/board', label: 'Доска объявлений' },
    ],
  },
  {
    title: 'финансы',
    section: SECTIONS.WALLET,
    items: [{ to: '/app/wallet', label: 'Кошелёк' }],
  },
  {
    title: 'профиль',
    section: SECTIONS.PROFILE,
    items: [
      { to: '/app/profile', label: 'О себе' },
      { to: '/app/profile/socials', label: 'Соцсети', section: SECTIONS.SOCIALS },
    ],
  },
  {
    title: 'администрирование',
    section: SECTIONS.ADMIN_WALLETS,
    items: [{ to: '/app/admin/wallets', label: 'Кошельки' }],
  },
];

const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  const userName = jwtMeta?.name || jwtMeta?.username;
  const allowedSections = getAllowedSections(role);
  const visibleMenu = MENU.filter((section) => allowedSections.includes(section.section)).map(
    (section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.section || allowedSections.includes(item.section)
      ),
    })
  );

  // Закрываем мобильное меню при переходе на другую страницу.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Блокируем скролл фона, пока открыт мобильный drawer.
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

  const nav = (
    <nav className={styles.nav}>
      {visibleMenu.map((section) => (
        <div key={section.title} className={styles.section}>
          <p className={styles.sectionTitle}>{section.title}</p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
      <button type="button" className={styles.logout} onClick={handleLogout}>
        Выйти
      </button>
    </nav>
  );

  // Без живого токена в кабинете делать нечего — на логин с возвратом обратно.
  if (!apiClient.hasLiveToken()) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  // Прямая ссылка на секцию, которая роли недоступна, — уводим на домашнюю страницу кабинета.
  const currentSection = sectionForPath(location.pathname);
  if (role && currentSection && !allowedSections.includes(currentSection)) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.headerSafeArea} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.burger}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineTop : ''}`} />
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineHidden : ''}`} />
              <span className={`${styles.burgerLine} ${menuOpen ? styles.burgerLineBottom : ''}`} />
            </button>
          </div>
          <span
            className={styles.logoLink}
            onClick={() => navigate('/app')}
            role="button"
            aria-label="offer"
          >
            <Logo light withText />
          </span>
          {userName && (
            <NavLink to="/app/profile" className={styles.user} title={userName}>
              <span className={styles.userAvatar} aria-hidden="true">
                {userName.trim().charAt(0).toUpperCase()}
              </span>
              <span className={styles.userText}>
                <span className={styles.userName}>{userName}</span>
                {role && <span className={styles.userRole}>{ROLE_LABELS[role] || role}</span>}
              </span>
            </NavLink>
          )}
        </div>
      </header>

      <aside className={styles.sidebar}>{nav}</aside>

      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropOpen : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        {nav}
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
