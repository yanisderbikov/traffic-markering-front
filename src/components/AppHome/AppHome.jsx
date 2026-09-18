import React from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { SECTIONS, getAllowedSections } from '../../permissions';
import { ROLE_LABELS } from '../../shared/dictionaries';
import styles from './AppHome.module.css';

// Плитки быстрых действий. Секция у плитки — та же, что в permissions.js,
// поэтому заказчику и криатору кабинет открывается разными наборами ссылок.
const TILES = [
  {
    section: SECTIONS.CAMPAIGNS,
    to: '/app/campaigns',
    title: 'мои объявления',
    text: 'Статусы, бюджеты и отклики по каждому объявлению.',
  },
  {
    section: SECTIONS.CAMPAIGNS,
    to: '/app/campaigns/new',
    title: 'новое объявление',
    text: 'Опишите задачу, задайте ставку за 1000 просмотров и бюджет.',
  },
  {
    section: SECTIONS.WALLET,
    to: '/app/wallet',
    title: 'кошелёк',
    text: 'Свободные деньги, резервы под объявления и история операций.',
  },
  {
    section: SECTIONS.APPLICATIONS,
    to: '/app/applications',
    title: 'мои отклики',
    text: 'Что взято в работу, сколько просмотров и сколько заработано.',
  },
  {
    section: SECTIONS.APPLICATIONS,
    to: '/app/board',
    title: 'доска объявлений',
    text: 'Свежие заказы от заказчиков — выберите, что снять.',
  },
  {
    section: SECTIONS.EARNINGS,
    to: '/app/earnings',
    title: 'заработок',
    text: 'Начисления за просмотры и вывод USDT на TRON-кошелёк.',
  },
  {
    section: SECTIONS.PROFILE,
    to: '/app/profile',
    title: 'о себе',
    text: 'Контакты и описание — их видит вторая сторона сделки.',
  },
  {
    section: SECTIONS.SOCIALS,
    to: '/app/profile/socials',
    title: 'соцсети',
    text: 'Подключённые аккаунты площадок, по которым считаются просмотры.',
  },
  {
    section: SECTIONS.FINANCE,
    to: '/app/finance',
    title: 'кошельки заказчиков',
    text: 'Остатки, пополнения и выводы по каждому заказчику.',
  },
  {
    section: SECTIONS.FINANCE,
    to: '/app/finance/payouts',
    title: 'выплаты криаторам',
    text: 'Выплаты криаторам: отправить USDT, приложить скриншот, дождаться подтверждения.',
  },
  {
    section: SECTIONS.FINANCE,
    to: '/app/finance/operations',
    title: 'все операции',
    text: 'Одна таблица по всем кошелькам: откуда, куда, сколько и в каком статусе.',
  },
  {
    section: SECTIONS.USERS,
    to: '/app/admin/users',
    title: 'пользователи и роли',
    text: 'Добавьте почту и назначьте роль: финансист, админ, заказчик или криатор.',
  },
];

const ROLE_GREETINGS = {
  CREATOR: 'Вы вошли как криатор: берите объявления в работу и получайте за просмотры.',
  CUSTOMER: 'Вы вошли как заказчик: публикуйте объявления и одобряйте отклики криаторов.',
  FINANCE_MANAGER:
    'Вы вошли как менеджер финансов: пополняйте кошельки заказчиков и следите за операциями.',
  ADMIN: 'Вы вошли как администратор: вам открыты кабинеты заказчика и криатора.',
  SUPER_ADMIN: 'Вы вошли как супер-админ: все кабинеты, финансы и управление ролями.',
};

const AppHome = () => {
  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  const userName = jwtMeta?.name || jwtMeta?.username;
  const allowedSections = getAllowedSections(role);
  const tiles = TILES.filter((tile) => allowedSections.includes(tile.section));

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>
        {userName ? `Привет, ${userName}` : 'Привет'}
      </h1>
      <p className={styles.subtitle}>
        {ROLE_GREETINGS[role] || `Вы вошли как ${ROLE_LABELS[role] || role || 'пользователь'}.`}
      </p>

      <div className={styles.tiles}>
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className={styles.tile}>
            <span className={styles.tileTitle}>{tile.title}</span>
            <span className={styles.tileText}>{tile.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppHome;
