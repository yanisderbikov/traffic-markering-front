import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../shared/PublicLayout/PublicLayout';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
import { REGISTER_CUSTOMER } from '../../shared/routes';
import ui from '../../shared/ui.module.css';
import styles from './AdvLanding.module.css';

const DEMO_CLIPS = [
  {
    handle: '@clips.daily',
    platform: 'tiktok',
    views: '1,2 млн просмотров',
    chip: ui.chipSuccess,
    verdict: 'в расчёт',
    note: 'оплачено по ставке',
  },
  {
    handle: '@stream.moments',
    platform: 'youtube',
    views: '84 тыс. просмотров',
    chip: ui.chipWarning,
    verdict: 'на проверке',
    note: 'начисление заморожено',
  },
  {
    handle: '@boost_views',
    platform: 'instagram',
    views: '310 тыс. просмотров',
    chip: ui.chipDanger,
    verdict: 'накрутка',
    note: 'списано 0 ₽',
  },
];

const PAINS = [
  {
    icon: 'wallet',
    pain: 'Оплатили размещение, а блогер пропал',
    answer:
      'Вперёд вы никому не платите. Бюджет лежит в вашем кошельке, а деньги идут только за просмотры роликов, которые вы одобрили.',
  },
  {
    icon: 'shield',
    pain: 'Охват сто тысяч, заказов ноль. Похоже на ботов',
    answer:
      'Просмотры берём из официального API площадки, а не со скриншотов. Подозрительный ролик замораживаем, накрутку не оплачиваем.',
  },
  {
    icon: 'chart',
    pain: 'Отдали двести тысяч за один пост и получили один пик',
    answer:
      'Одна кампания собирает десятки роликов от разных авторов. Работает объём, а не одно громкое имя.',
  },
  {
    icon: 'search',
    pain: 'Половина просмотров из стран, где нас не купят',
    answer:
      'Выберите регион: только РФ, СНГ или весь мир. Просмотры из других стран в расчёт не идут.',
  },
  {
    icon: 'refresh',
    pain: 'Биржа не вернула остаток бюджета',
    answer:
      'Неизрасходованный бюджет возвращается в ваш кошелёк, а из кошелька его можно вывести.',
  },
  {
    icon: 'users',
    pain: 'Сотня исполнителей в чатах и таблицах',
    answer:
      'Все ролики в одном кабинете: просмотры, сколько идёт в расчёт и вердикт антифрода. Одобрить или отклонить можно в один клик.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Опишите задачу',
    text: 'Бриф, референсы, баннеры и ссылки. Креатор увидит их до того, как возьмётся за ролик.',
  },
  {
    num: '02',
    title: 'Задайте ставку и правила',
    text: 'Ставка за 1000 просмотров, бюджет, площадки, регион, порог оплаты и лимит роликов на автора.',
  },
  {
    num: '03',
    title: 'Зарезервируйте бюджет',
    text: 'Деньги откладываются под кампанию в вашем кошельке. Пока просмотров нет, они никуда не уходят.',
  },
  {
    num: '04',
    title: 'Платите за результат',
    text: 'Вы одобряете ролики, платформа собирает статистику по API и списывает бюджет только за засчитанные просмотры.',
  },
];

const RULES = [
  { label: 'Ставка за 1000 просмотров', value: '40 ₽' },
  { label: 'Бюджет кампании', value: '150 000 ₽' },
  { label: 'Площадки', value: 'Shorts, TikTok, Reels' },
  { label: 'Регион просмотров', value: 'РФ, СНГ или весь мир' },
  { label: 'Оплата ролика', value: 'от 1 000 просмотров' },
  { label: 'Роликов от одного автора', value: 'не больше трёх' },
  { label: 'Длина ролика', value: 'от 15 секунд' },
  { label: 'Приём роликов', value: 'с 1 по 31 октября' },
];

const AUDIENCES = [
  {
    id: 'brands',
    title: 'Брендам и селлерам',
    text: 'Продвигайте товар, приложение или сервис десятками нативных роликов. Платите за охват, который случился, а не за имя блогера.',
    points: ['Маркетплейсы и D2C', 'Приложения и игры', 'Онлайн-школы и сервисы'],
  },
  {
    id: 'bloggers',
    title: 'Блогерам и стримерам',
    text: 'Нарезки ваших стримов и выпусков разойдутся по сотням аккаунтов. Никаких записей экрана и споров об «урезе»: просмотры считаются по API.',
    points: ['Нарезки стримов и подкастов', 'Продвижение треков и проектов', 'Рост основного канала'],
  },
];

const COMPARISON = [
  { label: 'Когда платите', before: 'Вперёд, до публикации', after: 'За засчитанные просмотры' },
  { label: 'Накрутка', before: 'Ваш риск', after: 'Не оплачивается' },
  { label: 'Откуда цифры', before: 'Скриншоты от блогера', after: 'Официальный API площадки' },
  { label: 'Охват', before: 'Один пост и один пик', after: 'Десятки роликов разных авторов' },
  { label: 'География', before: 'Какая придёт', after: 'Только выбранный регион' },
  { label: 'Остаток', before: 'Вся сумма уходит сразу', after: 'Возвращается в кошелёк' },
];

const FAQ = [
  {
    question: 'Что если креатор накрутит просмотры?',
    answer:
      'Антифрод проверяет каждый ролик. При признаках накрутки начисление замораживается до решения платформы. Если накрутка подтверждена, начисление обнуляется и бюджет не тратится. У новых креаторов оплачиваемые просмотры одного ролика ограничены, пока они не заработают репутацию.',
  },
  {
    question: 'Кто решает, какие ролики оплачивать?',
    answer:
      'Вы. В расчёт идут только ролики, которые вы одобрили. Если отклонить ролик, начисление по нему обнуляется, даже если раньше вы его одобряли.',
  },
  {
    question: 'Откуда берутся цифры просмотров?',
    answer:
      'Креатор подключает аккаунт через официальную страницу согласия площадки, и платформа забирает статистику ролика по API. Скриншоты и слова на веру не принимаются.',
  },
  {
    question: 'Могу ли я потратить больше, чем планировал?',
    answer:
      'Нет. Ставку за 1000 просмотров и бюджет задаёте вы. Когда бюджет исчерпан, кампания перестаёт тратить деньги.',
  },
  {
    question: 'Что будет с деньгами, если кампания не выстрелит?',
    answer:
      'Неизрасходованный бюджет возвращается в кошелёк, если уменьшить бюджет кампании. Из кошелька деньги можно вывести.',
  },
  {
    question: 'Как пополнить кошелёк?',
    answer:
      'Переводом USDT в сети TRC-20. Менеджер финансов проводит операцию, а вы подтверждаете её в истории кошелька. Вывод устроен так же.',
  },
  {
    question: 'Как работает регион просмотров?',
    answer:
      'Платформа оплачивает только просмотры из выбранного региона. Географию отдаёт только YouTube, и только если креатор подключил аналитику. Поэтому при регионе «только РФ» или «СНГ» ролики из TikTok и Instagram не оплачиваются. При «весь мир» в расчёт идут все площадки.',
  },
  {
    question: 'Какие площадки поддерживаются?',
    answer: 'YouTube Shorts, TikTok и Instagram Reels. В кампании можно оставить только нужные.',
  },
];

const CtaLink = ({ children = 'Запустить кампанию', className = styles.cta }) => (
  <Link to={REGISTER_CUSTOMER} className={className}>
    {children}
    <Icon name="arrowRight" size={18} />
  </Link>
);

const DemoCampaign = () => (
  <div className={styles.demo} role="img" aria-label="Пример кампании в кабинете рекламодателя">
    <div className={styles.demoHead}>
      <span className={styles.demoEyebrow}>Пример кампании</span>
      <span className={styles.demoPlatforms}>
        <SocialIcon name="youtube" />
        <SocialIcon name="tiktok" />
        <SocialIcon name="instagram" />
      </span>
    </div>
    <p className={styles.demoTitle}>Нарезки стрима с баннером</p>
    <div className={styles.demoStats}>
      <div className={styles.demoStat}>
        <span className={styles.demoStatLabel}>Ставка</span>
        <span className={styles.demoStatValue}>40 ₽ / 1000</span>
      </div>
      <div className={styles.demoStat}>
        <span className={styles.demoStatLabel}>Регион</span>
        <span className={styles.demoStatValue}>СНГ</span>
      </div>
    </div>
    <BudgetBar budgetKopecks={15000000} spentKopecks={6120000} />
    <ul className={styles.demoClips}>
      {DEMO_CLIPS.map((clip) => (
        <li key={clip.handle} className={styles.demoClip}>
          <span className={styles.demoClipIcon}>
            <SocialIcon name={clip.platform} />
          </span>
          <span className={styles.demoClipMain}>
            <span className={styles.demoClipHandle}>{clip.handle}</span>
            <span className={styles.demoClipViews}>{clip.views}</span>
          </span>
          <span className={styles.demoClipSide}>
            <span className={clip.chip}>{clip.verdict}</span>
            <span className={styles.demoClipNote}>{clip.note}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const AdvLanding = () => (
  <PublicLayout startTo={REGISTER_CUSTOMER}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>Для брендов и блогеров</span>
        <h1 className={styles.heroTitle}>Платите за просмотры, а не за обещания</h1>
        <p className={styles.heroText}>
          Креаторы снимают ролики под ваш бриф и публикуют их в Shorts, TikTok и Reels. Бюджет
          списывается только за просмотры, которые подтвердил API площадки.
        </p>
        <CtaLink />
        <p className={styles.heroNote}>Регистрация за минуту. Без пароля, вход по коду из письма.</p>
      </div>
      <DemoCampaign />
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Знакомо?</h2>
      <p className={styles.sectionLead}>
        Так рекламодатели описывают работу с блогерами и биржами. Мы собрали offer вокруг этих
        историй.
      </p>
      <div className={styles.pains}>
        {PAINS.map((item) => (
          <article key={item.pain} className={styles.pain}>
            <p className={styles.painQuote}>«{item.pain}»</p>
            <div className={styles.painAnswer}>
              <span className={styles.painIcon}>
                <Icon name={item.icon} size={18} />
              </span>
              <p className={styles.painText}>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.sectionCta}>
        <CtaLink>Хочу платить за результат</CtaLink>
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Как запустить кампанию</h2>
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

    <section className={styles.section}>
      <div className={styles.rulesCard}>
        <div className={styles.rulesCopy}>
          <h2 className={styles.sectionTitle}>Правила кампании задаёте вы</h2>
          <p className={styles.sectionLead}>
            Креатор видит все условия до того, как снимет ролик. Ролик не по правилам вы
            отклоняете, и он не стоит вам ни рубля.
          </p>
          <CtaLink>Настроить свою кампанию</CtaLink>
        </div>
        <dl className={styles.rules}>
          {RULES.map((rule) => (
            <div key={rule.label} className={styles.rule}>
              <dt className={styles.ruleLabel}>{rule.label}</dt>
              <dd className={styles.ruleValue}>{rule.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Кому подходит</h2>
      <div className={styles.audiences}>
        {AUDIENCES.map((audience) => (
          <article key={audience.id} id={audience.id} className={styles.audience}>
            <h3 className={styles.audienceTitle}>{audience.title}</h3>
            <p className={styles.audienceText}>{audience.text}</p>
            <ul className={styles.audiencePoints}>
              {audience.points.map((point) => (
                <li key={point} className={styles.audiencePoint}>
                  <Icon name="check" size={16} className={styles.audienceCheck} />
                  {point}
                </li>
              ))}
            </ul>
            <CtaLink className={styles.audienceLink}>Запустить кампанию</CtaLink>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Размещение у блогера и offer</h2>
      <div className={styles.compare} role="table" aria-label="Сравнение размещения у блогера и offer">
        <div className={`${styles.compareRow} ${styles.compareHead}`} role="row">
          <span role="columnheader" className={styles.compareLabel} />
          <span role="columnheader">Размещение у блогера</span>
          <span role="columnheader" className={styles.compareAccent}>
            offer
          </span>
        </div>
        {COMPARISON.map((row) => (
          <div key={row.label} className={styles.compareRow} role="row">
            <span role="rowheader" className={styles.compareLabel}>
              {row.label}
            </span>
            <span role="cell" className={styles.compareBefore}>
              {row.before}
            </span>
            <span role="cell" className={styles.compareAfter}>
              <Icon name="check" size={16} className={styles.compareCheck} />
              {row.after}
            </span>
          </div>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Частые вопросы</h2>
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

    <section className={styles.final}>
      <h2 className={styles.finalTitle}>Запустите первую кампанию сегодня</h2>
      <p className={styles.finalText}>
        Регистрация займёт минуту. Бриф, ставку и правила настроите сразу после входа.
      </p>
      <CtaLink className={styles.finalCta}>Стать рекламодателем</CtaLink>
    </section>
  </PublicLayout>
);

export default AdvLanding;
