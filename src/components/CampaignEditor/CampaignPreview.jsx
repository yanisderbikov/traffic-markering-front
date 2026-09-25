import React from 'react';
import apiClient from '../../apiClient';
import { formatRubles, rubToKopecks } from '../../shared/money';
import { viewRegionLabel } from '../../shared/viewRegion';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatCompactViews } from './campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

const CampaignPreview = ({ editor, showWallet = false }) => {
  const { form, wallet } = editor;
  const customerName = apiClient.getJwtMetadata()?.name || '';
  const rateKopecks = rubToKopecks(form.rateRub) || 0;
  const budgetKopecks = rubToKopecks(form.budgetRub) || 0;
  const minPayoutKopecks = rubToKopecks(form.minPayoutRub) || 0;
  const reachViews = rateKopecks > 0 ? Math.floor((budgetKopecks / rateKopecks) * 1000) : 0;
  const platforms = form.platforms.map((p) => PLATFORM_LABELS[p] || p).join(', ');

  return (
    <aside className={styles.preview}>
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>Предпросмотр оффера</h2>
        <div className={ui.chips}>
          {form.platforms.length > 0 ? (
            form.platforms.map((platform) => (
              <span key={platform} className={ui.chipActive}>
                {PLATFORM_LABELS[platform]}
              </span>
            ))
          ) : (
            <span className={ui.chipOutline}>Площадки не выбраны</span>
          )}
        </div>
        <p className={styles.previewTitle}>{form.title.trim() || 'Название кампании'}</p>
        <p className={styles.previewMeta}>
          {customerName || 'Бренд'}
          {platforms ? ` · ${platforms}` : ''}
          {form.viewRegion !== 'WORLD' ? ` · ${viewRegionLabel(form.viewRegion)}` : ''}
        </p>
        <p className={styles.previewRate}>
          {rateKopecks > 0 ? formatRubles(rateKopecks) : '— ₽'}{' '}
          <span className={styles.previewRateUnit}>/ 1 000</span>
        </p>
        <div className={ui.divider} />
        <div className={ui.kv}>
          <span className={ui.kvKey}>Бюджет</span>
          <span className={ui.kvValue}>{budgetKopecks > 0 ? formatRubles(budgetKopecks) : '—'}</span>
        </div>
        <div className={ui.kv}>
          <span className={ui.kvKey}>Потенциальный охват</span>
          <span className={ui.kvValue}>
            {reachViews > 0 ? `≈ ${formatCompactViews(reachViews)}` : '—'}
          </span>
        </div>
        <div className={ui.kv}>
          <span className={ui.kvKey}>Порог вывода</span>
          <span className={ui.kvValue}>
            {minPayoutKopecks > 0 ? formatRubles(minPayoutKopecks) : '—'}
          </span>
        </div>
        <p className={styles.previewNote}>
          Оценка по ставке, без гарантии объёма. Просмотры считаются по официальным API площадок.
        </p>
      </section>

      {showWallet && wallet && (
        <section className={ui.card}>
          <span className={ui.eyebrow}>Кошелёк</span>
          <p className={styles.previewRate}>{formatRubles(wallet.balanceKopecks ?? 0)}</p>
          <p className={styles.previewNote}>
            Свободно для резервирования. В кампаниях уже {formatRubles(wallet.allocatedKopecks ?? 0)}.
          </p>
        </section>
      )}

      <section className={ui.cardHint}>
        <p className={styles.hintTitle}>Хороший бриф — сильный контент</p>
        <p>Опишите результат и обязательные детали. Оставьте креатору пространство для идеи.</p>
      </section>
    </aside>
  );
};

export default CampaignPreview;
