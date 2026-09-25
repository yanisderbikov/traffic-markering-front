import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../shared/PublicLayout/PublicLayout';
import styles from './Landing.module.css';

const SIDES = [
  {
    id: 'brands',
    num: '01',
    title: 'Брендам — охват',
    text: 'Опишите задачу, задайте ставку и бюджет. Следите за публикациями и подтверждёнными просмотрами.',
    link: '/register?role=CUSTOMER',
    linkLabel: 'Запустить кампанию →',
  },
  {
    id: 'creators',
    num: '02',
    title: 'Креаторам — доход',
    text: 'Выбирайте подходящие офферы, создавайте контент и получайте оплату по прозрачным условиям.',
    link: '/board',
    linkLabel: 'Найти свой оффер →',
  },
];

const STEPS = [
  { num: '01', title: 'Выберите задачу', text: 'Бриф, формат и ставка видны заранее.' },
  { num: '02', title: 'Создайте контент', text: 'Согласуйте работу и опубликуйте видео.' },
  { num: '03', title: 'Получите результат', text: 'Отслеживайте просмотры и начисления.' },
];

const Landing = () => (
  <PublicLayout>
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>Монетизируй охваты</h1>
      <p className={styles.heroText}>
        Бренды покупают измеримый охват.
        <br />
        Креаторы создают контент и зарабатывают на просмотрах.
      </p>
      <div className={styles.heroActions}>
        <Link to="/register?role=CUSTOMER" className={styles.heroPrimary}>
          Я рекламодатель →
        </Link>
        <Link to="/register?role=CREATOR" className={styles.heroSecondary}>
          Я креатор →
        </Link>
      </div>
      <p className={styles.heroNote}>Прозрачные ставки. Понятный бюджет. Живые идеи.</p>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Две стороны. Одна платформа.</h2>
      <div className={styles.sides}>
        {SIDES.map((side) => (
          <article key={side.id} id={side.id} className={styles.side}>
            <span className={styles.num}>{side.num}</span>
            <h3 className={styles.sideTitle}>{side.title}</h3>
            <p className={styles.sideText}>{side.text}</p>
            <Link to={side.link} className={styles.sideLink}>
              {side.linkLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>От брифа до результата</h2>
      <div className={styles.steps}>
        {STEPS.map((step) => (
          <article key={step.num} className={styles.step}>
            <span className={styles.num}>{step.num}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  </PublicLayout>
);

export default Landing;
