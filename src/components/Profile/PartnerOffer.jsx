import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Icon from '../shared/Icon/Icon';
import Skeleton, { SkeletonText } from '../shared/Skeleton/Skeleton';
import { useSession } from '../../shared/session';
import { errorMessage } from '../../shared/auth';
import { formatPercent, formatRubles } from '../../shared/money';
import { partnerEffectivePercent } from '../../shared/referral';
import ui from '../../shared/ui.module.css';
import styles from './PartnerOffer.module.css';

const PartnerOffer = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let alive = true;
    apiClient.api
      .myPartner()
      .then((res) => {
        if (alive) setPartner(res.data);
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err, 'Не удалось загрузить партнёрскую программу'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const join = async () => {
    setJoining(true);
    setError('');
    try {
      await apiClient.api.activatePartner();
      toast.success('Вы партнёр offer — ссылка-приглашение ждёт во вкладке «Рефералка»');
      session.reload();
      navigate('/app/referral');
    } catch (err) {
      setError(errorMessage(err, 'Не удалось подключить партнёрскую программу'));
      setJoining(false);
    }
  };

  if (!loading && !partner && !error) return null;

  const active = Boolean(partner?.active);

  return (
    <section className={`${ui.cardAccent} ${styles.card}`} aria-busy={loading || undefined}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="gift" size={22} />
        </span>
        <div>
          <span className={ui.eyebrow}>Партнёрская программа</span>
          <h2 className={styles.title}>
            {active ? 'Вы партнёр offer' : 'Станьте партнёром offer'}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton}>
          <SkeletonText lines={3} />
          <Skeleton width="11rem" height={44} radius="var(--button-radius)" />
        </div>
      ) : active ? (
        <>
          <p className={styles.text}>
            Приглашено рекламодателей: {partner.invitedCount ?? 0}, заработано{' '}
            {formatRubles(partner.earnedKopecks ?? 0)}. Ссылка-приглашение и все начисления — во
            вкладке «Рефералка».
          </p>
          <Link to="/app/referral" className={`${ui.btnOnAccent} ${styles.action}`}>
            Открыть рефералку
            <Icon name="arrowRight" size={16} />
          </Link>
        </>
      ) : (
        partner && (
          <>
            <ul className={styles.terms}>
              <li>Делитесь ссылкой — она ведёт на страницу для рекламодателей с вашим именем.</li>
              <li>
                С пополнений и выводов приглашённых платформа берёт{' '}
                {formatPercent(partner.commissionPercent)} комиссии, а{' '}
                {formatPercent(partner.partnerSharePercent)} от неё — ваши: это{' '}
                {formatPercent(partnerEffectivePercent(partner))} от каждой суммы друга.
              </li>
              <li>
                Начисления сразу приходят на баланс в «Финансах» — их можно потратить на
                кампании.
              </li>
            </ul>
            <button
              type="button"
              className={`${ui.btnOnAccent} ${styles.action}`}
              onClick={join}
              disabled={joining}
            >
              {joining ? 'Подключаем…' : 'Присоединиться'}
            </button>
          </>
        )
      )}

      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
};

export default PartnerOffer;
