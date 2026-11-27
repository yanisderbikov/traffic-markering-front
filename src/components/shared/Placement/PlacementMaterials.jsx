import React from 'react';
import toast from 'react-hot-toast';
import { formatDay } from '../../../shared/dates';
import { commentTemplate } from '../../../shared/placement';
import styles from './Placement.module.css';

const copy = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} скопирован${what === 'Ссылка' ? 'а' : ''}`);
  } catch {
    toast.error('Не удалось скопировать — выделите текст вручную');
  }
};

const Material = ({ label, value, copyLabel, mono = false }) => (
  <div className={styles.material}>
    <span className={styles.materialLabel}>{label}</span>
    <div className={styles.materialValue}>
      <span className={mono ? styles.code : undefined}>{value}</span>
      <button type="button" className={styles.copy} onClick={() => copy(value, copyLabel)}>
        Копировать
      </button>
    </div>
  </div>
);

/**
 * Общие материалы кампании для креатора: ссылка, промокод и готовый текст комментария.
 * Показываем только то, что нужно для выбранного варианта.
 */
const PlacementMaterials = ({ placement, withLink, withPromo }) => {
  if (!placement) return null;
  const retainUntil = placement.retainUntil ? formatDay(placement.retainUntil) : null;
  const days = placement.retentionDays;
  return (
    <div className={styles.materials}>
      {withLink && placement.promoUrl && (
        <Material label="Рекламная ссылка — в ссылки профиля" value={placement.promoUrl} copyLabel="Ссылка" />
      )}
      {withPromo && placement.promoCode && (
        <>
          <Material label="Промокод" value={placement.promoCode} copyLabel="Промокод" mono />
          <Material
            label="Комментарий под роликом — закрепите его"
            value={commentTemplate({
              code: placement.promoCode,
              benefit: placement.promoBenefit,
              withLink,
            })}
            copyLabel="Текст"
          />
        </>
      )}
      {(withLink || withPromo) && (
        <p className={styles.note}>
          {retainUntil
            ? `Держите ${withLink && withPromo ? 'ссылку и закреп' : withLink ? 'ссылку' : 'закреп'} до ${retainUntil}.`
            : days
              ? `После подачи держите ${withLink && withPromo ? 'ссылку и закреп' : withLink ? 'ссылку' : 'закреп'} ${days} дн.`
              : ''}{' '}
          Ссылка и код общие для всех участников — заработок считаем по просмотрам вашего ролика.
        </p>
      )}
    </div>
  );
};

export default PlacementMaterials;
