import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubles, rubToKopecks } from '../../shared/money';
import { describePeriod, endOfDayIso, startOfDayIso } from '../../shared/dates';
import { viewRegionLabel } from '../../shared/viewRegion';
import { pluralize } from '../../shared/requirements';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import CampaignPreview from './CampaignPreview';
import { RequiredNote, STEP_FIELDS } from './CampaignSections';
import {
  CAMPAIGN_STEPS,
  FORM_STEPS,
  fieldLabel,
  firstIncompleteStep,
  formFromCampaign,
  missingFields,
  missingLabels,
} from './campaignForm';
import useCampaignForm from './useCampaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

const TIME_FORMATTER = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

const LAUNCH_STEP = CAMPAIGN_STEPS.length - 1;

const orDash = (value) => value || '—';

const moneyOrDash = (value) => {
  const kopecks = rubToKopecks(value);
  return kopecks == null ? '—' : formatRubles(kopecks);
};

const reviewRows = (form) => ({
  brief: [
    ['Название', orDash(form.title.trim())],
    ['Описание', form.description.trim() ? 'заполнено' : '—'],
    ['Обложка', form.photoKey ? 'загружена' : '—'],
    [
      'Материалы',
      form.materials.length
        ? `${form.materials.length} ${pluralize(form.materials.length, ['материал', 'материала', 'материалов'])}`
        : 'нет',
    ],
  ],
  terms: [
    ['Площадки', orDash(form.platforms.map((p) => PLATFORM_LABELS[p] || p).join(', '))],
    ['Регион просмотров', viewRegionLabel(form.viewRegion)],
    [
      'Приём работ',
      describePeriod(startOfDayIso(form.startsOn), endOfDayIso(form.endsOn)) || 'сразу, без срока',
    ],
    ['Длина ролика', form.minVideoSeconds ? `от ${form.minVideoSeconds} сек` : 'любая'],
    ['Роликов от креатора', form.maxVideosPerCreator || 'без ограничения'],
  ],
  budget: [
    ['Ставка за 1 000 просмотров', moneyOrDash(form.rateRub)],
    ['Общий бюджет', moneyOrDash(form.budgetRub)],
    ['Порог вывода', moneyOrDash(form.minPayoutRub)],
    ['Оплата', form.minPaidViews ? `от ${form.minPaidViews} просмотров` : 'с первого просмотра'],
  ],
});

const LaunchReview = ({ form, onEdit, disabled }) => {
  const rows = reviewRows(form);
  const missing = missingLabels(form);
  return (
    <div className={styles.review}>
      {FORM_STEPS.map((item) => {
        const stepMissing = missingLabels(form, item.fields);
        return (
          <section key={item.id} className={styles.reviewBlock}>
            <div className={styles.reviewHead}>
              <h3 className={styles.reviewTitle}>{item.title}</h3>
              <span className={stepMissing.length ? ui.chipWarning : ui.chipSuccess}>
                {stepMissing.length ? `Не заполнено: ${stepMissing.join(', ')}` : 'Заполнено'}
              </span>
              <button
                type="button"
                className={`${ui.linkAccent} ${styles.reviewEdit}`}
                onClick={() => onEdit(CAMPAIGN_STEPS.indexOf(item))}
                disabled={disabled}
              >
                Изменить
              </button>
            </div>
            {rows[item.id].map(([key, value]) => (
              <div key={key} className={ui.kv}>
                <span className={ui.kvKey}>{key}</span>
                <span className={ui.kvValue}>{value}</span>
              </div>
            ))}
          </section>
        );
      })}
      {missing.length > 0 ? (
        <p className={ui.hintWarn}>Чтобы запустить кампанию, заполните: {missing.join(', ')}.</p>
      ) : (
        <p className={ui.hintOk}>
          Всё готово. После запуска кампания появится в офферах, и креаторы начнут откликаться.
        </p>
      )}
    </div>
  );
};

const submitLabel = ({ next, saving, returnToReview }) => {
  if (!next) return saving ? 'Запуск…' : 'Запустить кампанию →';
  if (saving) return 'Сохраняем…';
  return returnToReview ? 'Вернуться к проверке →' : `Далее: ${next.title.toLowerCase()} →`;
};

const initialStep = (campaign, requestedId) => {
  const limit = firstIncompleteStep(formFromCampaign(campaign));
  const requested = CAMPAIGN_STEPS.findIndex((item) => item.id === requestedId);
  return requested >= 0 && requested <= limit ? requested : limit;
};

const CampaignWizard = ({ campaign: initialCampaign, onLaunched }) => {
  const editor = useCampaignForm(initialCampaign);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(() => initialStep(initialCampaign, searchParams.get('step')));
  const [visited, setVisited] = useState(step);
  const [returnToReview, setReturnToReview] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const current = CAMPAIGN_STEPS[step];
  const next = CAMPAIGN_STEPS[step + 1];
  const reachable = firstIncompleteStep(editor.form);
  const missing = next ? missingLabels(editor.form, current.fields) : missingLabels(editor.form);
  const StepFields = STEP_FIELDS[current.id];
  const busy = editor.busy || deleting;

  useEffect(() => {
    if (searchParams.get('step') === current.id) return;
    setSearchParams({ step: current.id }, { replace: true });
  }, [current.id, searchParams, setSearchParams]);

  const goTo = async (index, fromReview = false) => {
    if (index === step || busy) return;
    const forward = index > step;
    const saved = await editor.save({ fields: current.fields, requireFilled: forward });
    if (!saved) return;
    const target = forward ? Math.min(index, firstIncompleteStep(formFromCampaign(saved))) : index;
    setStep(target);
    setVisited((prev) => Math.max(prev, target));
    setReturnToReview((prev) => target !== LAUNCH_STEP && (fromReview || prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveDraft = async () => {
    const saved = await editor.save({ fields: current.fields });
    if (saved) toast.success('Черновик сохранён');
  };

  const leave = async () => {
    const saved = await editor.save({ fields: current.fields });
    if (saved) navigate('/app/campaigns');
  };

  const openWallet = async () => {
    if (busy) return;
    const result = await editor.saveValidFields();
    if (!result) return;
    if (result.skippedFields.length > 0) {
      toast(
        `Кампания сохранена в черновик, кроме: ${result.skippedFields.map(fieldLabel).join(', ')}. ` +
          'Заполните, когда вернётесь'
      );
    } else {
      toast.success('Кампания сохранена в черновик. Вернуться к ней можно из «Мои кампании»');
    }
    navigate('/app/wallet');
  };

  const launch = async () => {
    const saved = await editor.save({ requireFilled: true, status: 'ACTIVE' });
    if (!saved) return;
    toast.success('Кампания запущена');
    setSearchParams({}, { replace: true });
    onLaunched(saved);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!next) launch();
    else goTo(returnToReview ? LAUNCH_STEP : step + 1);
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить черновик? Всё, что вы заполнили, пропадёт.')) return;
    setDeleting(true);
    try {
      await apiClient.api.deleteCampaign(editor.campaign.id);
      toast.success('Черновик удалён');
      navigate('/app/campaigns', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось удалить черновик'));
      setDeleting(false);
    }
  };

  const saveState = editor.saving
    ? 'Сохраняем…'
    : editor.dirty
      ? 'Есть несохранённые изменения'
      : editor.savedAt
        ? `Черновик сохранён в ${TIME_FORMATTER.format(editor.savedAt)}`
        : 'Черновик сохранён';

  return (
    <div className={ui.page}>
      <button
        type="button"
        className={`${ui.backLink} ${styles.backButton}`}
        onClick={leave}
        disabled={busy}
      >
        <Icon name="arrowLeft" size={16} /> Мои кампании
      </button>

      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>{editor.campaign.title || 'Новая кампания'}</h1>
          <p className={styles.crumbs}>
            <span>
              Шаг {step + 1} из {CAMPAIGN_STEPS.length} · {current.title}
            </span>
            <span className={editor.dirty ? styles.saveStateDirty : styles.saveState}>{saveState}</span>
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <button
            type="button"
            className={`${ui.btnGhost} ${ui.btnSmall}`}
            onClick={handleDelete}
            disabled={busy}
          >
            <Icon name="trash" size={16} /> {deleting ? 'Удаление…' : 'Удалить черновик'}
          </button>
        </div>
      </header>

      <ol className={styles.stepper} aria-label="Шаги создания кампании">
        {CAMPAIGN_STEPS.map((item, index) => {
          const active = index === step;
          const complete = index < LAUNCH_STEP && missingFields(editor.form, item.fields).length === 0;
          const done = !active && index <= visited && complete;
          const open = !active && (index <= visited || index <= reachable);
          return (
            <li key={item.id} className={styles.stepperItem}>
              <button
                type="button"
                className={[
                  styles.stepperButton,
                  active ? styles.stepperActive : '',
                  done ? styles.stepperDone : '',
                  !active && !open ? styles.stepperLocked : '',
                ].join(' ')}
                onClick={() => goTo(index)}
                disabled={!open || busy}
                aria-current={active ? 'step' : undefined}
              >
                <span className={styles.stepperNum}>
                  {done ? <Icon name="check" size={14} /> : index + 1}
                </span>
                <span className={styles.stepperTitle}>{item.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className={styles.stepperProgress} aria-hidden="true">
        <div className={ui.track}>
          <div className={ui.fill} style={{ width: `${((step + 1) / CAMPAIGN_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form className={styles.editor} onSubmit={handleSubmit} noValidate>
        <div className={styles.formColumn}>
          <section className={ui.card}>
            <h2 className={styles.formTitle}>{current.heading}</h2>
            {StepFields ? (
              <>
                <StepFields editor={editor} onOpenWallet={openWallet} />
                <RequiredNote form={editor.form} fields={current.fields} />
              </>
            ) : (
              <LaunchReview
                form={editor.form}
                onEdit={(index) => goTo(index, true)}
                disabled={busy}
              />
            )}
            {editor.error && <p className={`${ui.errorText} ${styles.formError}`}>{editor.error}</p>}
          </section>

          <div className={styles.actions}>
            <div className={styles.actionsGroup}>
              {step > 0 && (
                <button
                  type="button"
                  className={`${ui.btnSecondary} ${ui.btnLarge}`}
                  onClick={() => goTo(step - 1)}
                  disabled={busy}
                >
                  ← Назад
                </button>
              )}
              <button
                type="button"
                className={`${ui.btnGhost} ${ui.btnLarge}`}
                onClick={saveDraft}
                disabled={busy}
              >
                Сохранить черновик
              </button>
            </div>
            <button
              type="submit"
              className={`${ui.btnPrimary} ${ui.btnLarge}`}
              disabled={busy || missing.length > 0}
              title={missing.length > 0 ? `Заполните: ${missing.join(', ')}` : undefined}
            >
              {submitLabel({ next, saving: editor.saving, returnToReview })}
            </button>
          </div>
        </div>

        <CampaignPreview editor={editor} showWallet />
      </form>
    </div>
  );
};

export default CampaignWizard;
