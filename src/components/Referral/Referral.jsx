import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Icon from '../shared/Icon/Icon';
import FitRubles from '../shared/FitRubles/FitRubles';
import Skeleton, { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import { errorMessage } from '../../shared/auth';
import { formatDate } from '../../shared/dictionaries';
import { commissionOf, formatPercent, formatRubles } from '../../shared/money';
import { inviteLink, partnerEffectivePercent } from '../../shared/referral';
import ui from '../../shared/ui.module.css';
import styles from './Referral.module.css';

const EXAMPLE_TOP_UP_KOPECKS = 4_000_000;

const copy = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Ссылка скопирована');
  } catch {
    toast.error('Не удалось скопировать — выделите ссылку вручную');
  }
};

const Referral = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let alive = true;
    apiClient.api
      .myPartner()
      .then((res) => {
        if (alive) setPartner(res.data);
      })
      .catch((err) => {
        if (alive) setPageError(errorMessage(err, 'Не удалось загрузить партнёрскую программу'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={ui.page} aria-busy="true">
        <SkeletonPageHead eyebrow="Партнёрская программа" title="Реферальная программа" />
        <div className={styles.top}>
          <Skeleton
            block
            height={190}
            radius="var(--card-radius)"
            className={styles.inviteSkeleton}
          />
          <Skeleton block height={120} radius="var(--card-radius)" />
          <Skeleton block height={120} radius="var(--card-radius)" />
          <Skeleton block height={120} radius="var(--card-radius)" />
        </div>
      </div>
    );
  }

  if (pageError && !partner) {
    return (
      <div className={ui.page}>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  if (!partner?.active) {
    return (
      <div className={ui.page}>
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>Партнёрская программа не подключена</p>
          <p className={ui.emptyText}>Присоединиться можно в профиле — это займёт один клик.</p>
          <Link to="/app/profile" className={ui.btnPrimary}>
            Перейти в профиль
          </Link>
        </div>
      </div>
    );
  }

  const link = inviteLink(partner.code);
  const share = formatPercent(partner.partnerSharePercent);
  const commission = formatPercent(partner.commissionPercent);
  const effective = formatPercent(partnerEffectivePercent(partner));
  const exampleCommission = commissionOf(EXAMPLE_TOP_UP_KOPECKS, partner.commissionPercent);
  const exampleReward = Math.floor(
    (exampleCommission * (Number(partner.partnerSharePercent) || 0)) / 100
  );
  const referrals = partner.referrals || [];
  const rewards = partner.rewards || [];

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Партнёрская программа</span>
          <h1 className={ui.title}>Реферальная программа</h1>
          <p className={ui.subtitle}>
            Делитесь offer с теми, кому он действительно полезен
            {partner.joinedAt ? ` · партнёр с ${formatDate(partner.joinedAt)}` : ''}
          </p>
        </div>
      </header>

      <div className={styles.top}>
        <section className={styles.invite}>
          <span className={styles.inviteLabel}>Ваша ссылка-приглашение</span>
          <p className={styles.inviteText}>
            Ведёт на страницу для рекламодателей — друг увидит, что его пригласили вы.
          </p>
          <div className={styles.linkRow}>
            <code className={styles.link}>{link}</code>
            <button type="button" className={ui.btnOnAccent} onClick={() => copy(link)}>
              <Icon name="copy" size={16} />
              Скопировать ссылку
            </button>
          </div>
        </section>

        <div className={ui.stat}>
          <span className={ui.statLabel}>Приглашено</span>
          <span className={ui.statValue}>{partner.invitedCount ?? 0}</span>
          <span className={ui.statNote}>зарегистрировались по ссылке</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Принесли доход</span>
          <span className={ui.statValue}>{partner.activeCount ?? 0}</span>
          <span className={ui.statNote}>пополнили кошелёк или вывели деньги</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Заработано · {share} комиссии</span>
          <FitRubles
            className={`${ui.statValue} ${ui.statAccent}`}
            kopecks={partner.earnedKopecks ?? 0}
          />
          <span className={ui.statNote}>
            <Link to="/app/wallet" className={ui.linkAccent}>
              уже на балансе в «Финансах»
            </Link>
          </span>
        </div>
      </div>

      <section className={`${ui.card} ${styles.terms}`}>
        <h2 className={ui.cardTitle}>Как это работает</h2>
        <ol className={ui.steps}>
          <li className={ui.step}>
            <span className={ui.stepNum}>1</span>
            <div>
              <p className={ui.stepTitle}>Поделитесь ссылкой</p>
              <p className={ui.stepText}>
                Друг попадёт на страницу для рекламодателей и зарегистрируется по приглашению.
              </p>
            </div>
          </li>
          <li className={ui.step}>
            <span className={ui.stepNum}>2</span>
            <div>
              <p className={ui.stepTitle}>Друг запускает рекламу</p>
              <p className={ui.stepText}>
                С каждого его пополнения и вывода платформа берёт {commission} комиссии.
              </p>
            </div>
          </li>
          <li className={ui.step}>
            <span className={ui.stepNum}>3</span>
            <div>
              <p className={ui.stepTitle}>Вы получаете {share} комиссии</p>
              <p className={ui.stepText}>
                Это {effective} от суммы друга: пополнил на {formatRubles(EXAMPLE_TOP_UP_KOPECKS)} —
                вам {formatRubles(exampleReward)}. Начисление приходит на баланс, как только
                операция проведена.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>Приглашённые</h2>
      </div>
      <section className={ui.card}>
        {referrals.length === 0 ? (
          <p className={styles.empty}>
            Пока никого. Отправьте ссылку знакомым брендам, селлерам или блогерам — они появятся
            здесь сразу после регистрации.
          </p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Рекламодатель</th>
                  <th>Зарегистрировался</th>
                  <th className={ui.right}>Начислений</th>
                  <th className={ui.right}>Вы заработали</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={`${referral.joinedAt}-${index}`}>
                    <td className={ui.strong}>{referral.name}</td>
                    <td className={ui.muted}>{formatDate(referral.joinedAt)}</td>
                    <td className={ui.right}>{referral.rewardsCount ?? 0}</td>
                    <td className={`${ui.right} ${ui.money}`}>
                      {formatRubles(referral.earnedKopecks ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rewards.length > 0 && (
        <>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionTitle}>Последние начисления</h2>
          </div>
          <section className={ui.card}>
            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Рекламодатель</th>
                    <th>Операция</th>
                    <th className={ui.right}>Комиссия платформы</th>
                    <th className={ui.right}>Ваша доля</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr key={reward.publicId}>
                      <td className={ui.muted}>{formatDate(reward.createdAt)}</td>
                      <td className={ui.strong}>{reward.referralName}</td>
                      <td>{reward.sourceTypeDescription}</td>
                      <td className={`${ui.right} ${ui.muted}`}>
                        {formatRubles(reward.commissionKopecks)}
                      </td>
                      <td className={`${ui.right} ${ui.money} ${ui.success}`}>
                        <Link to={`/app/wallet/${reward.publicId}`} className={styles.rewardLink}>
                          +{formatRubles(reward.rewardKopecks)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Referral;
