import React from 'react';
import { Link } from 'react-router-dom';
import InfoLayout from './InfoLayout';
import { SITE_URL } from './legal';
import styles from './Info.module.css';

const Info = () => (
  <InfoLayout
    title="О сервисе"
    lead="offer — площадка рекламных интеграций: рекламодатель публикует кампанию со ставкой за 1000 просмотров, креатор берёт её в работу и снимает ролик, а выплата считается по реальным просмотрам этого ролика."
  >
    <section className={styles.section}>
      <h2 className={styles.heading}>Как это работает</h2>
      <ol className={styles.list}>
        <li>Рекламодатель создаёт кампанию: описание интеграции, ставка за 1000 просмотров и бюджет.</li>
        <li>Креатор откликается на оффер и публикует ролик на своей площадке.</li>
        <li>
          Сервис периодически запрашивает у площадки статистику этого ролика по официальному API
          и начисляет креатору выплату по набранным просмотрам, пока не исчерпан бюджет кампании.
        </li>
      </ol>
    </section>

    <section className={styles.section}>
      <h2 className={styles.heading}>Зачем подключать аккаунт соцсети</h2>
      <p className={styles.text}>
        Просмотры мы берём не со слов креатора и не скриншотами, а из официального API площадки.
        Для этого креатор один раз подключает свой аккаунт через стандартную страницу согласия
        самой площадки. К одному профилю можно подключить сколько угодно аккаунтов на каждой площадке.
      </p>
      <p className={styles.text}>
        Мы запрашиваем только доступ на чтение. Публиковать, удалять или редактировать что-либо
        от вашего имени сервис не может и не запрашивает таких прав.
      </p>
    </section>

    <section className={styles.section}>
      <h2 className={styles.heading}>Отключение доступа</h2>
      <p className={styles.text}>
        Отвязать аккаунт можно в любой момент в разделе «Профиль» кабинета креатора: кнопка
        «Отвязать» рядом с аккаунтом. Сохранённые токены доступа при этом удаляются безвозвратно.
        Отозвать доступ можно и на стороне площадки — в настройках подключённых приложений вашего
        аккаунта.
      </p>
    </section>

    <section className={styles.section}>
      <h2 className={styles.heading}>Документы</h2>
      <ul className={styles.list}>
        <li>
          <Link className={styles.link} to="/info/terms">
            Пользовательское соглашение
          </Link>{' '}
          — правила работы на площадке и порядок выплат
        </li>
        <li>
          <Link className={styles.link} to="/info/privacy">
            Политика обработки персональных данных
          </Link>{' '}
          — какие данные мы собираем, зачем и как их удалить
        </li>
        <li>
          <Link className={styles.link} to="/info/consent">
            Согласие на обработку персональных данных
          </Link>{' '}
          — рассылки, аналитика и публичное портфолио
        </li>
        <li>
          <Link className={styles.link} to="/info/docs">
            Документация платформы
          </Link>{' '}
          — как устроен продукт, сценарии и финансовая модель
        </li>
      </ul>
      <p className={styles.text}>Адрес сервиса: {SITE_URL}</p>
    </section>
  </InfoLayout>
);

export default Info;
