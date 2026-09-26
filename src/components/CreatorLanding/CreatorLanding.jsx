import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../shared/PublicLayout/PublicLayout';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
import { formatRubles, formatViews } from '../../shared/money';
import { REGISTER_CREATOR } from '../../shared/routes';
import styles from './CreatorLanding.module.css';

const NAV = [
  { to: '/creator#how', label: 'Как это работает' },
  { to: '/creator#rules', label: 'Условия' },
  { to: '/creator#payouts', label: 'Выплаты' },
  { to: '/creator#faq', label: 'Вопросы' },
];

const DEMO = {
  rateKopecks: 5000,
  budgetKopecks: 20000000,
  spentKopecks: 7400000,
  views: 48200,
  requirements: ['оплата от 1 000 просмотров', 'вывод от 3 000 ₽', 'ролик от 15 сек', 'до 5 роликов'],
};

const DEMO_EARNED = Math.round((DEMO.views * DEMO.rateKopecks) / 1000);

const PROOFS = [
  { icon: 'wallet', text: 'Бюджет оффера зарезервирован заранее' },
  { icon: 'eye', text: 'Просмотры — из официального API площадки' },
  { icon: 'check', text: 'Выплаты в USDT с номером транзакции' },
];

const PAINS = [
  {
    pain: 'Снял ролик, а бюджет уже кончился',
    answer:
      'На каждом оффере видно, сколько бюджета выделено, потрачено и осталось. Смотришь до того, как снимать.',
  },
  {
    pain: 'Сделаю, а заплатят „если зайдёт“',
    answer:
      'Рекламодатель заранее пополняет кошелёк на платформе и резервирует бюджет оффера. Деньги уже здесь.',
  },
  {
    pain: 'Сумму решит модератор по записи экрана',
    answer:
      'Просмотры берём из официального API площадки. Начисление — ставка оффера за каждую 1000 просмотров.',
  },
  {
    pain: 'Потом урежут задним числом',
    answer:
      'Если площадка откатила просмотры после чистки ботов, уже начисленное не пересчитывается в меньшую сторону.',
  },
  {
    pain: 'Скинь доступ к аккаунту',
    answer:
      'Аккаунт подключается через страницу согласия самой площадки и только на чтение. Публиковать и удалять от твоего имени мы не можем.',
  },
  {
    pain: 'Выплату „отправили“, а где она?',
    answer:
      'К каждой выплате — номер транзакции TRON и скриншоты перевода. Получение подтверждаешь ты.',
  },
];

const STEPS = [
  { num: '01', title: 'Зарегистрируйся', text: 'Имя и почта. Вход по коду из письма, пароль не нужен.' },
  {
    num: '02',
    title: 'Подключи аккаунт',
    text: 'YouTube, TikTok или Instagram. Аккаунтов можно подключить сколько угодно.',
  },
  { num: '03', title: 'Возьми оффер', text: 'Сними ролик по брифу, опубликуй у себя и прикрепи ссылку.' },
  {
    num: '04',
    title: 'Получай за просмотры',
    text: 'Начисления приходят раз в сутки, вывод — в USDT на твой кошелёк.',
  },
];

const RULES = [
  {
    label: 'Ставка',
    example: '50 ₽ за 1 000 просмотров',
    text: 'Столько рекламодатель платит за каждую тысячу подтверждённых просмотров твоего ролика.',
  },
  {
    label: 'Порог оплаты',
    example: 'оплата от 1 000 просмотров',
    text: 'Ролик, набравший меньше, не оплачивается. После порога оплачиваются все просмотры.',
  },
  {
    label: 'Порог вывода',
    example: 'вывод от 3 000 ₽',
    text: 'Пока заработанное по офферу меньше порога, сумма ждёт зачисления. Дошла — уходит в кошелёк.',
  },
  {
    label: 'Неделя на проверку',
    example: 'просмотры старше 7 дней',
    text: 'За это время площадка списывает ботов, а платформа проверяет ролик. Потом просмотры идут в начисление.',
  },
  {
    label: 'Регион просмотров',
    example: 'только РФ · СНГ · весь мир',
    text: 'Географию отдаёт только YouTube с подключённой аналитикой. Если оффер ждёт просмотры из РФ или СНГ, ролики из TikTok и Instagram не оплачиваются — форма отклика предупредит заранее.',
  },
  {
    label: 'Лимиты и сроки',
    example: 'до 5 роликов от креатора',
    text: 'Сколько роликов можно подать, какой они должны быть длины и до какой даты принимаются отклики.',
  },
];

const PAYOUT_STEPS = [
  {
    title: 'Деньги в кошельке',
    text: 'Начисление приходит ночью, как только заработанное по офферу дошло до порога вывода.',
  },
  { title: 'Заявка на вывод', text: 'Нажимаешь «Вывести» и указываешь сумму и адрес кошелька TRON.' },
  {
    title: 'Перевод в USDT',
    text: 'Менеджер финансов отправляет USDT в сети TRC-20 и прикладывает номер транзакции и скриншоты.',
  },
  { title: 'Подтверждение', text: 'Проверяешь поступление и подтверждаешь получение в истории операций.' },
];

const USDT_TIPS = [
  'Подойдёт любой кошелёк, который принимает USDT в сети TRC-20.',
  'Адрес начинается с T и состоит из 34 символов.',
  'Проверь адрес дважды: перевод в сети TRON отменить нельзя.',
  'Номер транзакции можно проверить в любом обозревателе сети TRON.',
];

const AUDIENCES = [
  {
    title: 'Снимаешь шортсы, рилсы и тиктоки',
    text: 'Просмотры есть, а площадка за них не платит. Здесь платят рекламодатели.',
  },
  {
    title: 'Ведёшь несколько аккаунтов',
    text: 'Подключай все свои: число аккаунтов не ограничено, каждый ролик считается отдельно.',
  },
  {
    title: 'Снимаешь UGC',
    text: 'Вместо разового гонорара — оплата за каждую тысячу просмотров ролика на твоём аккаунте.',
  },
  {
    title: 'Только начинаешь',
    text: 'Миллион подписчиков не нужен: платят за просмотры ролика, а не за размер аккаунта.',
  },
];

const FAQ = [
  {
    question: 'Сколько стоит регистрация?',
    answer: 'Нисколько. Нужны только имя и почта, вход — по коду из письма.',
  },
  {
    question: 'Нужно много подписчиков?',
    answer: 'Нет. Оплата идёт за подтверждённые просмотры конкретного ролика по ставке оффера.',
  },
  {
    question: 'Зачем подключать аккаунт соцсети?',
    answer:
      'Чтобы брать просмотры из официального API площадки и подтверждать, что ролик опубликован у тебя. Доступ только на чтение, отвязать аккаунт можно в любой момент.',
  },
  {
    question: 'Когда приходят деньги?',
    answer:
      'Начисления идут раз в сутки ночью. Считаются просмотры старше семи дней, а сумма по офферу должна дойти до его порога вывода. Дальше — заявка на вывод в USDT.',
  },
  {
    question: 'Что будет, если бюджет оффера закончится?',
    answer:
      'Начисления ограничены остатком бюджета, поэтому он виден на каждой карточке. Выбирай офферы, где бюджет ещё есть.',
  },
  {
    question: 'Почему ролик из TikTok или Instagram может не оплачиваться?',
    answer:
      'Если оффер принимает только просмотры из РФ или СНГ. Географию отдаёт только YouTube с подключённой аналитикой, поэтому форма отклика заранее предупредит, если ссылка не подойдёт.',
  },
  {
    question: 'Что будет за накрутку?',
    answer:
      'Боты, фермы аккаунтов, платный трафик и ролики с чужих аккаунтов запрещены: такое начисление отклонят, а учётную запись могут заблокировать. Если прирост просмотров выглядит аномальным, начисление ставят на проверку.',
  },
  {
    question: 'Кому принадлежит ролик?',
    answer: 'Тебе. Рекламодатель получает право использовать ролик на условиях, указанных в оффере.',
  },
];

const CtaLink = ({ children = 'Стать креатором', className = styles.cta, tabIndex }) => (
  <Link to={REGISTER_CREATOR} className={className} tabIndex={tabIndex}>
    {children}
    <Icon name="arrowRight" size={18} />
  </Link>
);

const useStickyCta = () => {
  const heroRef = useRef(null);
  const finalRef = useRef(null);
  const [inView, setInView] = useState({ hero: true, final: false });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      setInView((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          if (entry.target === heroRef.current) {
            next.hero = entry.isIntersecting;
          } else {
            next.final = entry.isIntersecting || entry.boundingClientRect.top < 0;
          }
        });
        return next;
      });
    });
    [heroRef.current, finalRef.current].filter(Boolean).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return { heroRef, finalRef, visible: !inView.hero && !inView.final };
};

const DemoOffer = () => (
  <figure className={styles.demoWrap} aria-label="Пример оффера">
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <span className={styles.demoEyebrow}>Пример оффера</span>
        <span className={styles.demoPlatforms}>
          <SocialIcon name="youtube" />
          <SocialIcon name="tiktok" />
          <SocialIcon name="instagram" />
        </span>
      </div>
      <p className={styles.demoTitle}>Ролик с интеграцией мобильной игры</p>
      <p className={styles.demoRate}>
        <span className={styles.demoRateValue}>{formatRubles(DEMO.rateKopecks)}</span>
        <span className={styles.demoRateUnit}>за 1 000 просмотров</span>
      </p>
      <BudgetBar budgetKopecks={DEMO.budgetKopecks} spentKopecks={DEMO.spentKopecks} />
      <ul className={styles.demoChips}>
        {DEMO.requirements.map((item) => (
          <li key={item} className={styles.demoChip}>
            {item}
          </li>
        ))}
      </ul>
      <div className={styles.demoVideo}>
        <span className={styles.demoVideoMain}>
          <span className={styles.demoVideoLabel}>Твой ролик</span>
          <span className={styles.demoVideoViews}>{formatViews(DEMO.views)} просмотров</span>
        </span>
        <span className={styles.demoEarned}>
          <span className={styles.demoEarnedValue}>+{formatRubles(DEMO_EARNED)}</span>
          <span className={styles.demoEarnedNote}>по ставке оффера</span>
        </span>
      </div>
    </div>
  </figure>
);

const CreatorLanding = () => {
  const { heroRef, finalRef, visible } = useStickyCta();

  return (
    <PublicLayout nav={NAV} startTo={REGISTER_CREATOR} startLabel="Стать креатором">
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Для креаторов · Shorts · TikTok · Reels</span>
          <h1 className={styles.heroTitle}>
            Твои просмотры стоят <span className={styles.accent}>денег</span>
          </h1>
          <p className={styles.heroText}>
            YouTube, TikTok и Instagram не платят авторам из России за просмотры. В offer платят
            рекламодатели — за каждую 1000 подтверждённых просмотров твоего ролика.
          </p>
          <ul className={styles.proofs}>
            {PROOFS.map((proof) => (
              <li key={proof.text} className={styles.proof}>
                <span className={styles.proofIcon}>
                  <Icon name={proof.icon} size={16} />
                </span>
                {proof.text}
              </li>
            ))}
          </ul>
          <div ref={heroRef}>
            <CtaLink />
          </div>
          <p className={styles.heroNote}>Бесплатно. Имя, почта и код из письма — пароль не нужен.</p>
        </div>
        <DemoOffer />
      </section>

      <section className={styles.section} aria-labelledby="creator-pains">
        <div className={styles.sectionHead}>
          <h2 id="creator-pains" className={styles.sectionTitle}>
            Знакомо?
          </h2>
          <p className={styles.sectionLead}>
            На это креаторы чаще всего жалуются в конкурсах нарезок и на биржах блогеров. В offer это
            устроено так.
          </p>
        </div>
        <div className={styles.pains}>
          {PAINS.map((item) => (
            <article key={item.pain} className={styles.pain}>
              <p className={styles.painQuote}>
                <span className={styles.painMark}>
                  <Icon name="close" size={14} strokeWidth={2.2} />
                </span>
                «{item.pain}»
              </p>
              <div className={styles.painAnswer}>
                <span className={styles.painIcon}>
                  <Icon name="check" size={14} strokeWidth={2.2} />
                </span>
                <p className={styles.painText}>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.sectionCta}>
          <CtaLink>Хочу так</CtaLink>
        </div>
      </section>

      <section id="how" className={styles.section} aria-labelledby="creator-how">
        <div className={styles.sectionHead}>
          <h2 id="creator-how" className={styles.sectionTitle}>
            Четыре шага до первых денег
          </h2>
        </div>
        <div className={styles.steps}>
          {STEPS.map((step) => (
            <article key={step.num} className={styles.step}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </article>
          ))}
        </div>
        <div className={styles.sectionCta}>
          <CtaLink>Начать с шага 01</CtaLink>
        </div>
      </section>

      <section id="rules" className={styles.section} aria-labelledby="creator-rules">
        <div className={styles.sectionHead}>
          <h2 id="creator-rules" className={styles.sectionTitle}>
            Без мелкого шрифта
          </h2>
          <p className={styles.sectionLead}>
            Все условия оффера видны на карточке до того, как ты что-то снимешь.
          </p>
        </div>
        <div className={styles.rules}>
          {RULES.map((rule) => (
            <article key={rule.label} className={styles.rule}>
              <span className={styles.ruleLabel}>{rule.label}</span>
              <span className={styles.ruleExample}>{rule.example}</span>
              <p className={styles.ruleText}>{rule.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="payouts" className={styles.section} aria-labelledby="creator-payouts">
        <div className={styles.sectionHead}>
          <h2 id="creator-payouts" className={styles.sectionTitle}>
            Как выводятся деньги
          </h2>
          <p className={styles.sectionLead}>
            Выплаты — в USDT на твой кошелёк в сети TRON. Каждый перевод можно проверить.
          </p>
        </div>
        <div className={styles.payouts}>
          <ol className={styles.timeline}>
            {PAYOUT_STEPS.map((step, index) => (
              <li key={step.title} className={styles.timelineItem}>
                <span className={styles.timelineDot}>{index + 1}</span>
                <div>
                  <h3 className={styles.timelineTitle}>{step.title}</h3>
                  <p className={styles.timelineText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className={styles.usdt}>
            <h3 className={styles.usdtTitle}>Первый раз с USDT?</h3>
            <ul className={styles.usdtList}>
              {USDT_TIPS.map((tip) => (
                <li key={tip} className={styles.usdtItem}>
                  <Icon name="check" size={16} className={styles.usdtCheck} />
                  {tip}
                </li>
              ))}
            </ul>
            <CtaLink className={styles.usdtCta}>Зарегистрироваться</CtaLink>
          </aside>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="creator-audiences">
        <div className={styles.sectionHead}>
          <h2 id="creator-audiences" className={styles.sectionTitle}>
            Кому подойдёт
          </h2>
        </div>
        <div className={styles.audiences}>
          {AUDIENCES.map((audience) => (
            <Link key={audience.title} to={REGISTER_CREATOR} className={styles.audience}>
              <h3 className={styles.audienceTitle}>{audience.title}</h3>
              <p className={styles.audienceText}>{audience.text}</p>
              <span className={styles.audienceMore}>
                Это про меня
                <Icon name="arrowRight" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className={styles.section} aria-labelledby="creator-faq">
        <div className={styles.sectionHead}>
          <h2 id="creator-faq" className={styles.sectionTitle}>
            Частые вопросы
          </h2>
        </div>
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                {item.question}
                <Icon name="plus" size={18} className={styles.faqIcon} />
              </summary>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section ref={finalRef} className={styles.final} aria-labelledby="creator-final">
        <h2 id="creator-final" className={styles.finalTitle}>
          Просмотры у тебя уже есть. Пора за них получать
        </h2>
        <p className={styles.finalText}>
          Регистрация бесплатная и займёт минуту: имя, почта и код из письма.
        </p>
        <CtaLink className={styles.finalCta} />
      </section>

      <div
        className={`${styles.sticky} ${visible ? styles.stickyVisible : ''}`}
        aria-hidden={!visible}
      >
        <CtaLink className={styles.stickyCta} tabIndex={visible ? undefined : -1} />
      </div>
    </PublicLayout>
  );
};

export default CreatorLanding;
