import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import MaterialList from '../shared/MaterialList/MaterialList';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
import { budgetProgress, campaignAvailability } from '../shared/CampaignCard/CampaignCard';
import { formatRubles, formatViews } from '../../shared/money';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatDay } from '../../shared/dates';
import { campaignRequirements, formatSeconds } from '../../shared/requirements';
import { DEFAULT_VIEW_REGION, isWorldRegion, viewRegionHint, viewRegionLabel } from '../../shared/viewRegion';
import ui from '../../shared/ui.module.css';
import styles from './CampaignPage.module.css';

const CampaignPage = () => {
  const { publicId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const authorized = apiClient.hasLiveToken();
  const role = authorized ? apiClient.getJwtMetadata()?.role : null;
  const isCreator = role === 'CREATOR';

  const loadCampaign = useCallback(async () => {
    try {
      const res = await apiClient.api.boardCampaign(publicId);
      setCampaign(res.data);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить оффер'
      );
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  if (loading) {
    return (
      <div className={ui.page}>
        <p className={ui.message}>Загрузка оффера…</p>
      </div>
    );
  }

  if (pageError || !campaign) {
    return (
      <div className={ui.page}>
        <Link to={authorized ? '/app/board' : '/board'} className={ui.backLink}>
          <Icon name="arrowLeft" size={16} /> К офферам
        </Link>
        {pageError ? (
          <p className={ui.errorBanner}>{pageError}</p>
        ) : (
          <p className={ui.message}>Оффер не найден.</p>
        )}
      </div>
    );
  }

  const customer = campaign.customerCompany || campaign.customerName || 'Заказчик';
  const platforms = Array.isArray(campaign.platforms) ? campaign.platforms : [];
  const region = campaign.viewRegion || DEFAULT_VIEW_REGION;
  const materials = Array.isArray(campaign.materials) ? campaign.materials : [];
  const requirements = campaignRequirements(campaign);
  const availability = campaignAvailability(campaign);
  const { percent } = budgetProgress(campaign);
  const applyPath = `/campaigns/${publicId}/apply`;
  const boardPath = authorized ? '/app/board' : '/board';

  const steps = [
    {
      title: 'Снять ролик по брифу',
      text: [
        campaign.minVideoSeconds ? `Длина от ${formatSeconds(campaign.minVideoSeconds)}.` : '',
        platforms.length
          ? `Площадки: ${platforms.map((p) => PLATFORM_LABELS[p] || p).join(', ')}.`
          : '',
        'Покажите продукт естественно, в своём стиле.',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      title: 'Опубликовать и прислать ссылку',
      text: 'Откликнитесь на оффер ссылкой на ролик из подключённого аккаунта. Бренд увидит заявку сразу.',
    },
    {
      title: 'Получить одобрение и набирать просмотры',
      text: `После одобрения просмотры считаются по официальному API площадки. ${viewRegionHint(region, platforms)}.`,
    },
  ];

  const renderCta = (large = false) => {
    const size = large ? `${ui.btnPrimary} ${ui.btnLarge} ${ui.btnBlock}` : ui.btnPrimary;
    if (!authorized) {
      const from = encodeURIComponent(applyPath);
      return (
        <Link to={`/login?from=${from}`} className={size}>
          Войти и откликнуться
        </Link>
      );
    }
    if (!isCreator) {
      return (
        <Link to="/app" className={large ? `${ui.btnSecondary} ${ui.btnLarge} ${ui.btnBlock}` : ui.btnSecondary}>
          В личный кабинет
        </Link>
      );
    }
    if (!availability.open) {
      return (
        <span className={`${size} ${styles.ctaDisabled}`} aria-disabled="true">
          {availability.label}
        </span>
      );
    }
    return (
      <Link to={applyPath} className={size}>
        Откликнуться на оффер
      </Link>
    );
  };

  const ctaNote = !authorized
    ? 'Откликаются креаторы. Регистрация занимает минуту, пароль не нужен.'
    : !isCreator
      ? `Вы вошли как ${role === 'CUSTOMER' ? 'рекламодатель' : 'администратор'}. Отклики оставляют креаторы.`
      : 'Начисления зависят от подтверждённых просмотров и условий кампании.';

  return (
    <div className={ui.page}>
      <Link to={boardPath} className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> К офферам
      </Link>

      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <h1 className={ui.title}>{campaign.title}</h1>
          <p className={styles.crumbs}>
            Офферы / {customer}
            {!isWorldRegion(region) ? ` / ${viewRegionLabel(region)}` : ''}
          </p>
        </div>
        <div className={ui.pageHeadActions}>{renderCta()}</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <span className={styles.heroKicker}>{customer} / оффер</span>
          <h2 className={styles.heroTitle}>
            {formatRubles(campaign.ratePerThousandKopecks)} за 1 000 просмотров
          </h2>
          <p className={styles.heroText}>
            {availability.open
              ? 'Ставка, лимит и правила подсчёта известны до начала работы.'
              : availability.label}
          </p>
        </div>
        {campaign.photoUrl && (
          <div className={styles.heroMedia}>
            <img src={campaign.photoUrl} alt={campaign.title} />
          </div>
        )}
      </section>

      <div className={styles.columns}>
        <section className={ui.card}>
          <div className={ui.chips}>
            {platforms.map((platform) => (
              <span key={platform} className={ui.chip}>
                <SocialIcon name={platform} className={styles.chipIcon} />
                {PLATFORM_LABELS[platform] || platform}
              </span>
            ))}
            {!isWorldRegion(region) && <span className={ui.chip}>{viewRegionLabel(region)}</span>}
            <span className={availability.open ? ui.chipSuccess : ui.chipOutline}>
              {availability.label}
            </span>
          </div>

          <h2 className={styles.blockTitle}>О кампании</h2>
          <p className={styles.description}>{campaign.description}</p>

          <div className={ui.divider} />

          <h2 className={styles.blockTitle}>Что нужно сделать</h2>
          <ol className={ui.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={ui.step}>
                <span className={ui.stepNum}>{index + 1}</span>
                <div>
                  <p className={ui.stepTitle}>{step.title}</p>
                  <p className={ui.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={ui.divider} />

          <h2 className={styles.blockTitle}>Материалы и условия</h2>
          {materials.length > 0 ? (
            <MaterialList materials={materials} className={styles.materials} />
          ) : (
            <p className={ui.message}>Бренд не прикладывал материалы. Ориентируйтесь на описание.</p>
          )}
          {requirements.length > 0 && (
            <dl className={styles.requirements}>
              {requirements.map((row) => (
                <div key={row.key} className={styles.requirement}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.value}
                    {row.hint && <span className={styles.requirementHint}>{row.hint}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <aside className={styles.aside}>
          <section className={ui.card}>
            <span className={ui.eyebrow}>Ставка за результат</span>
            <p className={styles.rate}>{formatRubles(campaign.ratePerThousandKopecks)}</p>
            <p className={styles.rateUnit}>за 1 000 подтверждённых просмотров</p>
            <div className={ui.divider} />
            <div className={ui.kv}>
              <span className={ui.kvKey}>Осталось в бюджете</span>
              <span className={ui.kvValue}>{formatRubles(campaign.remainingKopecks)}</span>
            </div>
            <div className={ui.kv}>
              <span className={ui.kvKey}>Порог вывода</span>
              <span className={ui.kvValue}>{formatRubles(campaign.minPayoutKopecks)}</span>
            </div>
            {campaign.minPaidViews ? (
              <div className={ui.kv}>
                <span className={ui.kvKey}>Оплата от</span>
                <span className={ui.kvValue}>{formatViews(campaign.minPaidViews)} просмотров</span>
              </div>
            ) : null}
            {campaign.maxVideosPerCreator ? (
              <div className={ui.kv}>
                <span className={ui.kvKey}>Роликов от креатора</span>
                <span className={ui.kvValue}>до {campaign.maxVideosPerCreator}</span>
              </div>
            ) : null}
            {campaign.endsAt && (
              <div className={ui.kv}>
                <span className={ui.kvKey}>Срок приёма работ</span>
                <span className={ui.kvValue}>{formatDay(campaign.endsAt)}</span>
              </div>
            )}
            <div className={ui.kv}>
              <span className={ui.kvKey}>Откликов</span>
              <span className={ui.kvValue}>{campaign.applicationsCount ?? 0}</span>
            </div>
            <div className={styles.budgetTrack}>
              <div className={ui.track} aria-hidden="true">
                <div className={ui.fill} style={{ width: `${percent}%` }} />
              </div>
              <span className={styles.budgetNote}>Выплачено {percent}% бюджета</span>
            </div>
            <div className={styles.asideCta}>{renderCta(true)}</div>
            <p className={styles.ctaNote}>{ctaNote}</p>
          </section>

          <section className={ui.cardSuccess}>
            <p className={styles.successTitle}>
              <Icon name="check" size={18} /> Прозрачные условия
            </p>
            <p>Ставка, лимит и правила подсчёта доступны до начала работы.</p>
          </section>
        </aside>
      </div>

      <section className={styles.bottomCta}>
        <div>
          <p className={styles.bottomTitle}>Всё готово к первой публикации?</p>
          <p className={styles.bottomText}>Изучите бриф и отправьте заявку на участие.</p>
        </div>
        {renderCta()}
      </section>
    </div>
  );
};

export default CampaignPage;
