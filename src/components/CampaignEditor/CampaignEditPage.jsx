import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Icon from '../shared/Icon/Icon';
import { CAMPAIGN_STATUS_LABELS } from '../../shared/dictionaries';
import CampaignLoader from './CampaignLoader';
import CampaignPreview from './CampaignPreview';
import { CAMPAIGN_CHIP, campaignStatusLabel } from './CampaignOverview';
import { STEP_FIELDS } from './CampaignSections';
import { FORM_STEPS } from './campaignForm';
import useCampaignForm from './useCampaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

const statusOptions = (current) =>
  current === 'DRAFT' ? ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'] : ['ACTIVE', 'PAUSED', 'COMPLETED'];

const CampaignEditForm = ({ campaign: initialCampaign }) => {
  const editor = useCampaignForm(initialCampaign);
  const navigate = useNavigate();
  const [status, setStatus] = useState(initialCampaign.status);
  const { campaign } = editor;
  const changed = editor.dirty || status !== campaign.status;
  const back = `/app/campaigns/${campaign.id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await editor.save({ requireFilled: status !== 'DRAFT', status });
    if (!saved) return;
    toast.success('Кампания сохранена');
    navigate(back);
  };

  return (
    <div className={ui.page}>
      <Link to={back} className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> К кампании
      </Link>

      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>Изменить объявление</h1>
          <p className={styles.crumbs}>
            <span className={CAMPAIGN_CHIP[campaign.status] || ui.chipOutline}>
              {campaignStatusLabel(campaign)}
            </span>
            <span>{campaign.title || 'Без названия'}</span>
            <span>
              <span className={styles.required}>*</span> — обязательные поля
            </span>
          </p>
        </div>
      </header>

      <form className={styles.editor} onSubmit={handleSubmit} noValidate>
        <div className={styles.formColumn}>
          {FORM_STEPS.map((step) => {
            const Fields = STEP_FIELDS[step.id];
            return (
              <section key={step.id} className={ui.card}>
                <h2 className={styles.formTitle}>{step.title}</h2>
                <Fields editor={editor} />
              </section>
            );
          })}

          {editor.error && <p className={ui.errorBanner}>{editor.error}</p>}
          {!editor.error && changed && (
            <p className={styles.formNote}>Есть несохранённые изменения</p>
          )}

          <div className={styles.actions}>
            <label className={styles.statusField}>
              <span className={ui.label}>Статус</span>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={ui.input}
              >
                {statusOptions(campaign.status).map((option) => (
                  <option key={option} value={option}>
                    {CAMPAIGN_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.actionsGroup}>
              <Link to={back} className={`${ui.btnSecondary} ${ui.btnLarge}`}>
                Отмена
              </Link>
              <button
                type="submit"
                className={`${ui.btnPrimary} ${ui.btnLarge}`}
                disabled={editor.busy || !changed}
              >
                {editor.saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>

        <CampaignPreview editor={editor} />
      </form>
    </div>
  );
};

const CampaignEditPage = () => {
  const { campaignId } = useParams();
  return (
    <CampaignLoader key={campaignId} campaignId={campaignId}>
      {({ campaign }) => <CampaignEditForm campaign={campaign} />}
    </CampaignLoader>
  );
};

export default CampaignEditPage;
