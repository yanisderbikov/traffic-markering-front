import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import apiClient from './apiClient';
import styles from './App.module.css';
import Board from './components/Board/Board';
import CampaignPage from './components/CampaignPage/CampaignPage';
import ApplyPage from './components/ApplyPage/ApplyPage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import NotFound from './components/NotFound/NotFound';
import AppLayout from './components/AppLayout/AppLayout';
import AppHome from './components/AppHome/AppHome';
import CustomerCampaigns from './components/CustomerCampaigns/CustomerCampaigns';
import CampaignEditor from './components/CampaignEditor/CampaignEditor';
import CreatorApplications from './components/CreatorApplications/CreatorApplications';
import Profile from './components/Profile/Profile';
import CreatorSocialAccounts from './components/CreatorSocialAccounts/CreatorSocialAccounts';
import Wallet from './components/Wallet/Wallet';
import AdminWallets from './components/AdminWallets/AdminWallets';
import Info from './components/Info/Info';
import Privacy from './components/Info/Privacy';
import Terms from './components/Info/Terms';

// Статические пути приложения. Всё, чего здесь нет и что не подошло под
// динамические шаблоны ниже, — 404 (и такие страницы закрываем от индексации).
const KNOWN_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/info',
  '/info/privacy',
  '/info/terms',
  '/app',
  '/app/board',
  '/app/campaigns',
  '/app/applications',
  '/app/profile',
  '/app/profile/socials',
  '/app/wallet',
  '/app/admin/wallets',
]);

// Динамические маршруты: карточка объявления и редактор объявления.
const DYNAMIC_PATHS = [
  /^\/campaigns\/[^/]+$/,
  /^\/campaigns\/[^/]+\/apply$/,
  /^\/app\/campaigns\/[^/]+$/,
];

// Заголовок и описание вкладки по пути. Ключ — уже нормализованный pathname.
const PAGE_SEO = {
  '/': {
    title: 'offer — доска рекламных объявлений',
    description:
      'Объявления на рекламные интеграции: ставка за 1000 просмотров и бюджет заказчика. Берите заказ в работу и зарабатывайте на просмотрах.',
  },
  '/login': {
    title: 'вход — offer',
    description: 'Вход в личный кабинет offer.',
  },
  '/register': {
    title: 'регистрация — offer',
    description: 'Регистрация заказчика или криатора в offer.',
  },
  '/info': {
    title: 'о сервисе — offer',
    description:
      'Как работает offer: объявления со ставкой за 1000 просмотров, подключение аккаунтов соцсетей и подсчёт просмотров по официальным API площадок.',
  },
  '/info/privacy': {
    title: 'политика конфиденциальности — offer',
    description:
      'Какие данные собирает offer, зачем, как они хранятся и как отозвать доступ или удалить учётную запись.',
  },
  '/info/terms': {
    title: 'условия использования — offer',
    description:
      'Правила работы на площадке offer: подключение аккаунтов, расчёт просмотров и выплат, запреты и ответственность.',
  },
};

const upsertMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

function App() {
  const location = useLocation();
  // Хвостовой слэш ломает совпадение с KNOWN_PATHS и плодит дубли адресов,
  // поэтому /app/campaigns/ редиректим на /app/campaigns.
  const normalizedPathname =
    location.pathname.length > 1
      ? location.pathname.replace(/\/+$/, '')
      : location.pathname;
  const isKnownPage =
    KNOWN_PATHS.has(normalizedPathname) ||
    DYNAMIC_PATHS.some((pattern) => pattern.test(normalizedPathname));

  useEffect(() => {
    const seo = PAGE_SEO[normalizedPathname] || {
      title: 'offer',
      description: 'Платформа рекламных интеграций offer.',
    };
    // Личный кабинет и несуществующие адреса в выдаче не нужны.
    const isPrivatePage =
      !isKnownPage ||
      normalizedPathname.startsWith('/app') ||
      normalizedPathname.endsWith('/apply');

    document.title = seo.title;
    upsertMetaTag('meta[name="description"]', {
      name: 'description',
      content: seo.description,
    });
    upsertMetaTag('meta[name="robots"]', {
      name: 'robots',
      content: isPrivatePage ? 'noindex,nofollow' : 'index,follow',
    });
  }, [normalizedPathname, isKnownPage]);

  if (location.pathname !== normalizedPathname) {
    return (
      <Navigate
        to={{ pathname: normalizedPathname, search: location.search, hash: location.hash }}
        replace
      />
    );
  }

  return (
    <div className={styles.app}>
      <Routes>
        <Route
          path="/"
          element={apiClient.hasLiveToken() ? <Navigate to="/app" replace /> : <Board />}
        />
        <Route path="/campaigns/:publicId" element={<CampaignPage />} />
        <Route path="/campaigns/:publicId/apply" element={<ApplyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/info" element={<Info />} />
        <Route path="/info/privacy" element={<Privacy />} />
        <Route path="/info/terms" element={<Terms />} />
        <Route element={<AppLayout />}>
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/board" element={<Board embedded />} />
          <Route path="/app/campaigns" element={<CustomerCampaigns />} />
          {/* campaignId = "new" — создание объявления, uuid — правка и отклики. */}
          <Route path="/app/campaigns/:campaignId" element={<CampaignEditor />} />
          <Route path="/app/applications" element={<CreatorApplications />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/profile/socials" element={<CreatorSocialAccounts />} />
          <Route path="/app/wallet" element={<Wallet />} />
          <Route path="/app/admin/wallets" element={<AdminWallets />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
