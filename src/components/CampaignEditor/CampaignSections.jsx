import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FieldError from '../shared/FieldError/FieldError';
import MaterialList from '../shared/MaterialList/MaterialList';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
import Skeleton from '../shared/Skeleton/Skeleton';
import { VIDEO_PLATFORMS } from '../../shared/video';
import {
  VIEW_REGIONS,
  platformLabels,
  platformsWithoutGeography,
  viewRegionLabel,
} from '../../shared/viewRegion';
import { formatRubles, rubToKopecks } from '../../shared/money';
import { useDebouncedValue } from '../../shared/useDebouncedValue';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { MATERIALS_MAX, compareToMedian, isRequired, missingFields } from './campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

export const FieldLabel = ({ field, htmlFor, children }) => {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <Tag className={ui.label} htmlFor={htmlFor}>
      {children}
      {isRequired(field) && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </Tag>
  );
};

export const RequiredNote = ({ form, fields }) => {
  const required = fields.filter(isRequired);
  if (required.length === 0) {
    return <p className={styles.requiredNote}>Все поля шага необязательные</p>;
  }
  if (missingFields(form, fields).length === 0) {
    return <p className={styles.requiredDone}>Обязательные поля заполнены</p>;
  }
  return (
    <p className={styles.requiredNote}>
      <span className={styles.required}>*</span> — обязательные поля
    </p>
  );
};

const inputProps = (editor, name) => ({
  name,
  value: editor.form[name],
  className: ui.input,
  'aria-invalid': editor.errors[name] ? 'true' : undefined,
  'aria-required': isRequired(name) || undefined,
  autoComplete: 'off',
});

const MoneyInput = ({ editor, id, name }) => (
  <div className={styles.money}>
    <input
      id={id}
      type="text"
      inputMode="decimal"
      onChange={editor.setMoneyField}
      {...inputProps(editor, name)}
    />
    <span className={styles.moneyUnit}>₽</span>
  </div>
);

const PERCENT_FORMATTER = new Intl.NumberFormat('ru-RU');

const formatPercent = (percent) =>
  `${percent > 0 ? '+' : percent < 0 ? '−' : ''}${PERCENT_FORMATTER.format(Math.abs(percent))}%`;

const MEDIAN_SETTLE_MS = 1000;

const MEDIAN_TONES = {
  above: { className: styles.medianAbove, text: 'выше среднего по площадке' },
  below: { className: styles.medianBelow, text: 'ниже среднего по площадке' },
  even: { className: '', text: 'на уровне среднего по площадке' },
};

const MedianComparison = ({ value, medianKopecks, loading }) => {
  const settledValue = useDebouncedValue(value, MEDIAN_SETTLE_MS);
  if (loading) {
    return (
      <span className={styles.median}>
        <Skeleton width="min(18rem, 90%)" />
      </span>
    );
  }
  if (medianKopecks == null) return null;
  const median = <span className={styles.medianValue}>{formatRubles(medianKopecks)}</span>;
  const kopecks = rubToKopecks(value);
  const settled = value === settledValue;
  const comparison = settled ? compareToMedian(kopecks, medianKopecks) : null;
  const tone = comparison ? MEDIAN_TONES[comparison.tone] : null;
  const comparing = !settled && kopecks > 0;
  return (
    <span
      className={`${styles.median} ${tone?.className || ''}`}
      title="Медиана по запущенным кампаниям площадки"
    >
      {comparison && (
        <>
          <span className={styles.medianPercent}>{formatPercent(comparison.percent)}</span>
          {tone.text}: {median}
        </>
      )}
      {comparing && (
        <>
          <span className={styles.medianPercent}>
            <span className={styles.medianSpinner} aria-hidden="true" />
          </span>
          сравниваем со средним по площадке: {median}
        </>
      )}
      {!comparison && !comparing && <>В среднем по площадке — {median}</>}
    </span>
  );
};

const IntInput = ({ editor, id, name }) => (
  <input id={id} type="text" inputMode="numeric" onChange={editor.setIntField} {...inputProps(editor, name)} />
);

export const BriefFields = ({ editor }) => {
  const { form, errors, photoPreview, uploadProgress, materialProgress, materialsFull, link } = editor;
  return (
    <>
      <div className={styles.field}>
        <FieldLabel field="title" htmlFor="campaign-title">
          Название кампании
        </FieldLabel>
        <input
          id="campaign-title"
          type="text"
          onChange={editor.setField}
          maxLength={255}
          placeholder="Например, «Город в твоём ритме»"
          {...inputProps(editor, 'title')}
        />
        <FieldError>{errors.title}</FieldError>
      </div>

      <div className={styles.field}>
        <FieldLabel field="description" htmlFor="campaign-description">
          Описание и требования
        </FieldLabel>
        <textarea
          id="campaign-description"
          onChange={editor.setField}
          rows={6}
          placeholder="Опишите результат и обязательные детали. Оставьте креатору пространство для идеи."
          {...inputProps(editor, 'description')}
          className={ui.textarea}
        />
        <FieldError>{errors.description}</FieldError>
      </div>

      <div className={styles.field}>
        <FieldLabel field="photoKey">Обложка</FieldLabel>
        <div className={styles.photoRow}>
          <div className={styles.photoPreview}>
            {photoPreview ? (
              <img src={photoPreview} alt="Обложка кампании" />
            ) : (
              <span className={styles.photoEmpty}>Нет обложки</span>
            )}
          </div>
          <div className={styles.photoControls}>
            <label
              className={`${ui.btnSecondary} ${styles.fileBtn} ${
                uploadProgress !== null ? styles.fileBtnBusy : ''
              }`}
            >
              <Icon name="plus" size={16} />
              {uploadProgress !== null
                ? `Загрузка ${uploadProgress}%`
                : photoPreview
                  ? 'Заменить обложку'
                  : 'Загрузить обложку'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={editor.handlePhotoChange}
                className={styles.fileInput}
                disabled={uploadProgress !== null}
              />
            </label>
            <span className={ui.hint}>JPEG, PNG, WebP или GIF до 10 МБ.</span>
            <FieldError>{errors.photoKey}</FieldError>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <FieldLabel field="materials">Бриф и материалы</FieldLabel>
        <span className={ui.hint}>
          PDF, изображения, архив до 100 МБ или ссылка. Всего до {MATERIALS_MAX} материалов.
        </span>
        <MaterialList
          materials={form.materials}
          onRemove={editor.removeMaterial}
          className={styles.materials}
        />
        <div className={styles.materialAdd}>
          <label
            className={`${ui.btnSecondary} ${styles.fileBtn} ${
              materialProgress !== null || materialsFull ? styles.fileBtnBusy : ''
            }`}
          >
            <Icon name="file" size={16} />
            {materialProgress !== null ? `Загрузка ${materialProgress}%` : 'Файл'}
            <input
              type="file"
              onChange={editor.handleMaterialChange}
              className={styles.fileInput}
              disabled={materialProgress !== null || materialsFull}
            />
          </label>
          <input
            type="text"
            name="url"
            value={link.url}
            onChange={editor.setLinkField}
            onKeyDown={editor.addLinkOnEnter}
            className={ui.input}
            aria-invalid={editor.linkError ? 'true' : undefined}
            maxLength={2048}
            autoComplete="off"
            placeholder="Ссылка на материалы"
            disabled={materialsFull}
          />
          <input
            type="text"
            name="title"
            value={link.title}
            onChange={editor.setLinkField}
            onKeyDown={editor.addLinkOnEnter}
            className={ui.input}
            maxLength={255}
            autoComplete="off"
            placeholder="Подпись"
            disabled={materialsFull}
          />
          <button
            type="button"
            className={ui.btnSecondary}
            onClick={editor.handleAddLink}
            disabled={materialsFull}
          >
            Добавить ссылку
          </button>
        </div>
        <FieldError>{editor.linkError}</FieldError>
      </div>
    </>
  );
};

export const TermsFields = ({ editor }) => {
  const { form, errors } = editor;
  const blindPlatforms = platformsWithoutGeography(form.platforms);
  const regionBlindWarning = form.viewRegion !== 'WORLD' && blindPlatforms.length > 0;

  return (
    <>
      <div className={styles.field}>
        <FieldLabel field="platforms">Площадки</FieldLabel>
        <div className={ui.chips} role="group" aria-label="Площадки">
          {VIDEO_PLATFORMS.map((platform) => {
            const selected = form.platforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                className={selected ? ui.chipActive : ui.chip}
                onClick={() => editor.togglePlatform(platform)}
                aria-pressed={selected}
              >
                {selected ? (
                  <Icon name="check" size={14} />
                ) : (
                  <SocialIcon name={platform} className={styles.chipIcon} />
                )}
                {PLATFORM_LABELS[platform]}
              </button>
            );
          })}
        </div>
        <FieldError>{errors.platforms}</FieldError>
        <span className={ui.hint}>Креатор сможет подать ролик только с выбранных площадок.</span>
      </div>

      <div className={styles.field}>
        <FieldLabel field="viewRegion">Регион просмотров</FieldLabel>
        <div className={ui.chips} role="radiogroup" aria-label="Регион просмотров">
          {VIEW_REGIONS.map((region) => {
            const selected = form.viewRegion === region;
            return (
              <button
                key={region}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? ui.chipActive : ui.chip}
                onClick={() => editor.setViewRegion(region)}
              >
                {viewRegionLabel(region)}
              </button>
            );
          })}
        </div>
        <FieldError>{errors.viewRegion}</FieldError>
        <span className={ui.hint}>
          Оплачиваются только просмотры из выбранного региона; «весь мир» — все просмотры.
        </span>
        {regionBlindWarning && (
          <span className={ui.hintWarn}>
            {platformLabels(blindPlatforms)} географию просмотров{' '}
            {blindPlatforms.length > 1 ? 'не отдают' : 'не отдаёт'}: ролики оттуда по такому
            региону не оплатятся. Географию отдаёт только YouTube с доступом к аналитике.
          </span>
        )}
      </div>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <FieldLabel field="startsOn" htmlFor="campaign-starts">
            Приём работ с
          </FieldLabel>
          <input
            id="campaign-starts"
            type="date"
            onChange={editor.setField}
            {...inputProps(editor, 'startsOn')}
          />
          <FieldError>{errors.startsOn}</FieldError>
          <span className={ui.hint}>Пусто — сразу после запуска.</span>
        </div>
        <div className={styles.field}>
          <FieldLabel field="endsOn" htmlFor="campaign-ends">
            Приём работ до
          </FieldLabel>
          <input
            id="campaign-ends"
            type="date"
            onChange={editor.setField}
            min={form.startsOn || undefined}
            {...inputProps(editor, 'endsOn')}
          />
          <FieldError>{errors.endsOn}</FieldError>
          <span className={ui.hint}>По Москве, включительно. Пусто — без ограничения.</span>
        </div>
        <div className={styles.field}>
          <FieldLabel field="minVideoSeconds" htmlFor="campaign-length">
            Длина ролика от, сек
          </FieldLabel>
          <IntInput editor={editor} id="campaign-length" name="minVideoSeconds" />
          <FieldError>{errors.minVideoSeconds}</FieldError>
          <span className={ui.hint}>Проверяете вручную.</span>
        </div>
        <div className={styles.field}>
          <FieldLabel field="maxVideosPerCreator" htmlFor="campaign-max-videos">
            Роликов от одного креатора
          </FieldLabel>
          <IntInput editor={editor} id="campaign-max-videos" name="maxVideosPerCreator" />
          <FieldError>{errors.maxVideosPerCreator}</FieldError>
          <span className={ui.hint}>Пусто — без ограничения.</span>
        </div>
      </div>
    </>
  );
};

const isPlainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export const BudgetFields = ({ editor, onOpenWallet }) => {
  const {
    form,
    errors,
    availableKopecks,
    savedBudgetKopecks,
    campaign,
    benchmarks,
    benchmarksLoading,
    walletLoading,
    prefillRate,
  } = editor;
  const launched = campaign.status !== 'DRAFT';

  useEffect(() => {
    prefillRate();
  }, [prefillRate]);

  const handleWalletClick = (e) => {
    if (!onOpenWallet || !isPlainClick(e)) return;
    e.preventDefault();
    onOpenWallet();
  };

  return (
    <div className={styles.fieldGrid}>
      <div className={styles.field}>
        <FieldLabel field="rateRub" htmlFor="campaign-rate">
          Ставка за 1 000 просмотров
        </FieldLabel>
        <MoneyInput editor={editor} id="campaign-rate" name="rateRub" />
        <FieldError>{errors.rateRub}</FieldError>
        <MedianComparison
          value={form.rateRub}
          medianKopecks={benchmarks?.medianRatePerThousandKopecks}
          loading={benchmarksLoading}
        />
      </div>
      <div className={styles.field}>
        <FieldLabel field="budgetRub" htmlFor="campaign-budget">
          Общий бюджет
        </FieldLabel>
        <MoneyInput editor={editor} id="campaign-budget" name="budgetRub" />
        <FieldError>{errors.budgetRub}</FieldError>
        <MedianComparison
          value={form.budgetRub}
          medianKopecks={benchmarks?.medianBudgetKopecks}
          loading={benchmarksLoading}
        />
        <span className={ui.hint}>
          Резервируется из кошелька при сохранении.
          {walletLoading && (
            <>
              {' '}
              <Skeleton width="10rem" />
            </>
          )}
          {availableKopecks != null && (
            <>
              {' '}
              Доступно {formatRubles(availableKopecks)}
              {launched && savedBudgetKopecks > 0
                ? ` (из них ${formatRubles(savedBudgetKopecks)} уже в этой кампании)`
                : ''}
              .
            </>
          )}{' '}
          <Link to="/app/wallet" className={ui.linkAccent} onClick={handleWalletClick}>
            Финансы
          </Link>
        </span>
      </div>
      <div className={styles.field}>
        <FieldLabel field="minPayoutRub" htmlFor="campaign-min-payout">
          Порог вывода для креатора
        </FieldLabel>
        <MoneyInput editor={editor} id="campaign-min-payout" name="minPayoutRub" />
        <FieldError>{errors.minPayoutRub}</FieldError>
        <span className={ui.hint}>
          Заработанное по кампании уходит в кошелёк креатора, когда накопится эта сумма.
        </span>
      </div>
      <div className={styles.field}>
        <FieldLabel field="minPaidViews" htmlFor="campaign-min-views">
          Оплата от, просмотров
        </FieldLabel>
        <IntInput editor={editor} id="campaign-min-views" name="minPaidViews" />
        <FieldError>{errors.minPaidViews}</FieldError>
        <span className={ui.hint}>Ниже порога ролик не оплачивается. Пусто — платите за все.</span>
      </div>
    </div>
  );
};

export const STEP_FIELDS = {
  brief: BriefFields,
  terms: TermsFields,
  budget: BudgetFields,
};
