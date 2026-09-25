import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import apiClient from './apiClient';
import styles from './App.module.css';
import Board from './components/Board/Board';
import Landing from './components/Landing/Landing';
import ShellSwitch from './components/AppLayout/ShellSwitch';
import CampaignPage from './components/CampaignPage/CampaignPage';
import ApplyPage from './components/ApplyPage/ApplyPage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import NotFound from './components/NotFound/NotFound';
import AppLayout from './components/AppLayout/AppLayout';
import AppHome from './components/AppHome/AppHome';
import CustomerCampaigns from './components/CustomerCampaigns/CustomerCampaigns';
import CampaignEditor from './components/CampaignEditor/CampaignEditor';
import CampaignEditPage from './components/CampaignEditor/CampaignEditPage';
import CreatorApplications from './components/CreatorApplications/CreatorApplications';
import Profile from './components/Profile/Profile';
import CreatorSocialAccounts from './components/CreatorSocialAccounts/CreatorSocialAccounts';
import CustomerWallet from './components/CustomerWallet/CustomerWallet';
import FinanceCustomers from './components/FinanceCustomers/FinanceCustomers';
import FinanceCustomer from './components/FinanceCustomer/FinanceCustomer';
import AdminUsers from './components/AdminUsers/AdminUsers';
import AdminFraud from './components/AdminFraud/AdminFraud';
import AdminCreators from './components/AdminFraud/AdminCreators';
import CreatorEarnings from './components/CreatorEarnings/CreatorEarnings';
import OperationPage from './components/OperationPage/OperationPage';
import FinancePayouts from './components/FinancePayouts/FinancePayouts';
import FinancePayout from './components/FinancePayout/FinancePayout';
import FinanceOperations from './components/FinanceOperations/FinanceOperations';
import FinanceTopUps from './components/FinanceTopUps/FinanceTopUps';
import Info from './components/Info/Info';
import Privacy from './components/Info/Privacy';
import Terms from './components/Info/Terms';

// Статические пути приложения. Всё, чего здесь нет и что не подошло под
// динамические шаблоны ниже, — 404 (и такие страницы закрываем от индексации).
const KNOWN_PATHS = new Set([
  '/',
  '/board',
  '/login',
  '/register',
  '/info',
  '/info/privacy',
  '/info/terms',
  '/app',
  '/app/board',
  '/app/campaigns',
  '/app/wallet',
  '/app/applications',
  '/app/earnings',
  '/app/finance',
  '/app/finance/top-ups',
  '/app/finance/payouts',
  '/app/finance/operations',
  '/app/admin/users',
  '/app/admin/fraud',
  '/app/admin/fraud/creators',
  '/app/profile',
  '/app/profile/socials',
]);

// Динамические маршруты: карточка объявления и редактор объявления.
const DYNAMIC_PATHS = [
  /^\/campaigns\/[^/]+$/,
  /^\/campaigns\/[^/]+\/apply$/,
  /^\/app\/campaigns\/[^/]+$/,
  /^\/app\/finance\/\d+$/,
  /^\/app\/earnings\/\d+$/,
  /^\/app\/wallet\/\d+$/,
  /^\/app\/finance\/payouts\/\d+$/,
  /^\/app\/finance\/operations\/\d+$/,
];

// Заголовок и описание вкладки по пути. Ключ — уже нормализованный pathname.
const PAGE_SEO = {
  '/': {
    title: 'offer — монетизируй охваты',
    description:
      'Бренды покупают измеримый охват, креаторы создают контент и зарабатывают на просмотрах. Прозрачные ставки, понятный бюджет.',
  },
  '/board': {
    title: 'офферы — offer',
    description:
      'Открытые офферы на рекламные интеграции: ставка за 1000 просмотров и остаток бюджета. Берите оффер в работу и зарабатывайте на просмотрах.',
  },
  '/login': {
    title: 'вход — offer',
    description: 'Вход в личный кабинет offer.',
  },
  '/register': {
    title: 'регистрация — offer',
    description: 'Регистрация заказчика или креатора в offer.',
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
          element={apiClient.hasLiveToken() ? <Navigate to="/app" replace /> : <Landing />}
        />
        <Route path="/board" element={<Board />} />
        <Route element={<ShellSwitch />}>
          <Route path="/campaigns/:publicId" element={<CampaignPage />} />
          <Route path="/campaigns/:publicId/apply" element={<ApplyPage />} />
        </Route>
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
          <Route path="/app/campaigns/:campaignId/edit" element={<CampaignEditPage />} />
          <Route path="/app/wallet" element={<CustomerWallet />} />
          <Route path="/app/wallet/:operationId" element={<OperationPage scope="wallet" />} />
          <Route path="/app/applications" element={<CreatorApplications />} />
          <Route path="/app/earnings" element={<CreatorEarnings />} />
          <Route path="/app/earnings/:operationId" element={<OperationPage scope="earnings" />} />
          <Route path="/app/finance" element={<FinanceCustomers />} />
          <Route path="/app/finance/top-ups" element={<FinanceTopUps />} />
          <Route path="/app/finance/payouts" element={<FinancePayouts />} />
          <Route path="/app/finance/payouts/:payoutId" element={<FinancePayout />} />
          <Route path="/app/finance/operations" element={<FinanceOperations />} />
          <Route
            path="/app/finance/operations/:operationId"
            element={<OperationPage scope="finance" />}
          />
          <Route path="/app/finance/:userId" element={<FinanceCustomer />} />
          <Route path="/app/admin/users" element={<AdminUsers />} />
          <Route path="/app/admin/fraud" element={<AdminFraud />} />
          <Route path="/app/admin/fraud/creators" element={<AdminCreators />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/profile/socials" element={<CreatorSocialAccounts />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
