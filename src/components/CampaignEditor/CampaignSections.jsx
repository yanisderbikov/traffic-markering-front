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
  viewRegionLabel,
} from '../../shared/viewRegion';
import { formatRubles, formatViews, rubToKopecks } from '../../shared/money';
import { useDebouncedValue } from '../../shared/useDebouncedValue';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { pluralize } from '../../shared/requirements';
import PlacementRates from '../shared/Placement/PlacementRates';
import { commentTemplate } from '../../shared/placement';
import {
  DEFAULT_RETENTION_DAYS,
  MATERIALS_MAX,
  isSnapshotForm,
  TOPIC_NAME_MAX,
  compareToMedian,
  compareToTopicAverage,
  findTopic,
  isRequired,
  maxMinPayoutKopecks,
  minPaidViewsFor,
  missingFields,
} from './campaignForm';
import useTopicSearch from './useTopicSearch';
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

const TopicRateAdvice = ({ value, topic }) => {
  const settledValue = useDebouncedValue(value, MEDIAN_SETTLE_MS);
  const average = (
    <span className={styles.medianValue}>{formatRubles(topic.averageRatePerThousandKopecks)}</span>
  );
  const tone =
    value === settledValue
      ? compareToTopicAverage(rubToKopecks(value), topic.averageRatePerThousandKopecks)
      : null;
  if (tone === 'below') {
    return (
      <span className={ui.hintWarn}>
        Ниже средней ставки по тематике «{topic.description}» — {average} за 1 000 просмотров.
        Лучше добавить: за такую ставку креаторы берутся неохотно, и роликов может не быть.
      </span>
    );
  }
  if (tone === 'ok') {
    return (
      <span className={ui.hintOk}>
        Не ниже средней по тематике «{topic.description}» — {average}. Креаторам будет интересно.
      </span>
    );
  }
  return (
    <span className={ui.hint}>
      Средняя ставка по тематике «{topic.description}» — {average} за 1 000 просмотров.
    </span>
  );
};

const TopicChip = ({ topic, selected, ...props }) => (
  <button type="button" className={selected ? ui.chipActive : ui.chip} {...props}>
    {selected && <Icon name="check" size={14} />}
    {topic.description}
    {topic.averageRatePerThousandKopecks != null && (
      <span className={styles.topicRate}>~{formatRubles(topic.averageRatePerThousandKopecks)}</span>
    )}
  </button>
);

const TopicSearch = ({ editor }) => {
  const search = useTopicSearch(editor.selectTopic);
  const typed = search.query.trim().replace(/\s+/g, ' ');
  return (
    <div className={styles.topicSearch}>
      <div className={styles.topicSearchBox}>
        <Icon name="search" size={16} className={styles.topicSearchIcon} />
        <input
          type="text"
          className={ui.input}
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onKeyDown={search.onKeyDown}
          maxLength={TOPIC_NAME_MAX}
          placeholder="Найти или добавить тематику"
          aria-label="Найти или добавить тематику"
          autoComplete="off"
        />
      </div>
      {search.active && (
        <div className={styles.topicResults} aria-live="polite">
          {search.searching ? (
            <span className={styles.topicSearching}>
              <span className={styles.medianSpinner} aria-hidden="true" />
              Ищем…
            </span>
          ) : (
            <>
              {search.results.length > 0 ? (
                <div className={ui.chips}>
                  {search.results.map((item) => (
                    <TopicChip
                      key={item.code}
                      topic={item}
                      selected={editor.form.topic === item.code}
                      aria-pressed={editor.form.topic === item.code}
                      onClick={() => search.pick(item)}
                    />
                  ))}
                </div>
              ) : (
                !search.error && <span className={ui.hint}>Такой тематики пока нет.</span>
              )}
              {search.canAdd && (
                <button
                  type="button"
                  className={ui.linkAccent}
                  onClick={search.add}
                  disabled={search.adding}
                >
                  <Icon name="plus" size={14} />
                  {search.adding ? 'Добавляем…' : `Добавить «${typed}»`}
                </button>
              )}
              {search.error && <span className={ui.hintWarn}>{search.error}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const TopicField = ({ editor }) => {
  const { form, errors, topics, topic, benchmarksLoading } = editor;
  // Выбранная поиском тематика может не входить в топ — показываем её в общем ряду
  const chips = topic && !findTopic(topics, topic.code) ? [...topics, topic] : topics;
  return (
    <div className={styles.field}>
      <FieldLabel field="topic">Тематика</FieldLabel>
      {benchmarksLoading ? (
        <Skeleton width="min(24rem, 90%)" />
      ) : chips.length === 0 ? (
        <span className={ui.hintWarn}>Не удалось загрузить популярные тематики — найдите свою поиском.</span>
      ) : (
        <div className={ui.chips} role="radiogroup" aria-label="Тематика">
          {chips.map((item) => {
            const selected = form.topic === item.code;
            return (
              <TopicChip
                key={item.code}
                topic={item}
                selected={selected}
                role="radio"
                aria-checked={selected}
                onClick={() => editor.setTopic(item.code)}
              />
            );
          })}
        </div>
      )}
      <TopicSearch editor={editor} />
      <FieldError>{errors.topic}</FieldError>
      <span className={ui.hint}>
        Рядом — средняя ставка за 1 000 просмотров по тематике. От неё посчитаем подсказку на шаге
        бюджета. Нет подходящей — найдите поиском или добавьте свою.
      </span>
    </div>
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

      <TopicField editor={editor} />

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
    fillAvailableBudget,
    topic,
  } = editor;
  const launched = campaign.status !== 'DRAFT';
  const minPaidViews = minPaidViewsFor(form.minPaidRub, form.rateRub);
  const maxPayoutPercent = benchmarks?.maxPayoutBudgetPercent;
  const maxPayoutKopecks = maxMinPayoutKopecks(form.budgetRub, maxPayoutPercent);

  useEffect(() => {
    prefillRate();
  }, [prefillRate]);

  const handleWalletClick = (e) => {
    if (!onOpenWallet || !isPlainClick(e)) return;
    e.preventDefault();
    onOpenWallet();
  };

  const snapshot = isSnapshotForm(form);

  return (
    <>
    <div className={styles.field}>
      <span className={ui.label}>Как платить за просмотры</span>
      <div className={ui.chips} role="radiogroup" aria-label="Как платить за просмотры">
        {PAYMENT_MODELS.map((model) => {
          const selected = form.paymentModel === model.value;
          return (
            <button
              key={model.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? ui.chipActive : ui.chip}
              onClick={() => editor.setPaymentModel(model.value)}
              disabled={launched && campaign.applicationsCount > 0 && !selected}
            >
              {model.label}
            </button>
          );
        })}
      </div>
      <span className={ui.hint}>
        {snapshot
          ? 'Креатор подаёт ролик, когда он набрал просмотры: они фиксируются на момент подачи. К базовой ставке — надбавки за вашу ссылку в профиле и промокод в закреплённом комментарии; без них креатор участвует по базе.'
          : 'Деньги начисляются по мере роста просмотров одобренного ролика.'}
        {launched && campaign.applicationsCount > 0 ? ' Способ оплаты не поменять: по кампании уже есть отклики.' : ''}
      </span>
    </div>
    <div className={styles.fieldGrid}>
      <div className={styles.field}>
        <FieldLabel field="rateRub" htmlFor="campaign-rate">
          {snapshot ? 'Базовая ставка за 1 000 просмотров' : 'Ставка за 1 000 просмотров'}
        </FieldLabel>
        <MoneyInput editor={editor} id="campaign-rate" name="rateRub" />
        <FieldError>{errors.rateRub}</FieldError>
        {topic?.averageRatePerThousandKopecks != null ? (
          <TopicRateAdvice value={form.rateRub} topic={topic} />
        ) : (
          <MedianComparison
            value={form.rateRub}
            medianKopecks={benchmarks?.medianRatePerThousandKopecks}
            loading={benchmarksLoading}
          />
        )}
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
          {availableKopecks > 0 && (
            <>
              <button
                type="button"
                className={ui.linkAccent}
                onClick={fillAvailableBudget}
                disabled={rubToKopecks(form.budgetRub) === availableKopecks}
              >
                Использовать всё
              </button>
              {' · '}
            </>
          )}
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
          {maxPayoutPercent ? ` Не больше ${maxPayoutPercent}% бюджета` : ''}
          {maxPayoutKopecks != null ? ` — до ${formatRubles(maxPayoutKopecks)}` : ''}
          {maxPayoutPercent ? '.' : ''}
        </span>
      </div>
      <div className={styles.field}>
        <FieldLabel field="minPaidRub" htmlFor="campaign-min-paid">
          Оплата от
        </FieldLabel>
        <MoneyInput editor={editor} id="campaign-min-paid" name="minPaidRub" />
        <FieldError>{errors.minPaidRub}</FieldError>
        <span className={ui.hint}>
          {minPaidViews
            ? `≈ ${formatViews(minPaidViews)} ${pluralize(minPaidViews, ['просмотр', 'просмотра', 'просмотров'])} по вашей ставке. `
            : ''}
          Ролик, заработавший меньше, не оплачивается. Пусто — платите за все.
        </span>
      </div>
    </div>
    {snapshot && <SnapshotFields editor={editor} />}
    </>
  );
};

const PAYMENT_MODELS = [
  { value: 'CONTINUOUS', label: 'По мере роста просмотров' },
  { value: 'SNAPSHOT', label: 'Ссылка и промокод' },
];

const ConditionalLabel = ({ htmlFor, required, children }) => (
  <label className={ui.label} htmlFor={htmlFor}>
    {children}
    {required && (
      <span className={styles.required} aria-hidden="true">
        *
      </span>
    )}
  </label>
);

const SnapshotFields = ({ editor }) => {
  const { form, errors, campaign } = editor;
  const linkBonus = rubToKopecks(form.linkBonusRub) ?? 0;
  const promoBonus = rubToKopecks(form.promoBonusRub) ?? 0;
  const base = rubToKopecks(form.rateRub) ?? 0;
  // Ссылку и код тем, кто уже взял оффер, не поменять: они разместили прежние
  const locked = campaign.status !== 'DRAFT' && campaign.applicationsCount > 0;
  const code = form.promoCode.trim();

  return (
    <div className={styles.field}>
      <div className={ui.divider} />
      <span className={ui.label}>Ссылка в профиле и промокод в закрепе</span>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={ui.label} htmlFor="campaign-link-bonus">
            Надбавка за ссылку в профиле
          </label>
          <MoneyInput editor={editor} id="campaign-link-bonus" name="linkBonusRub" />
          <FieldError>{errors.linkBonusRub}</FieldError>
          <span className={ui.hint}>За 1 000 просмотров сверх базы. Пусто или 0 — не платите.</span>
        </div>
        <div className={styles.field}>
          <label className={ui.label} htmlFor="campaign-promo-bonus">
            Надбавка за промокод в закрепе
          </label>
          <MoneyInput editor={editor} id="campaign-promo-bonus" name="promoBonusRub" />
          <FieldError>{errors.promoBonusRub}</FieldError>
          <span className={ui.hint}>За 1 000 просмотров сверх базы. Пример: база 50%, ссылка 30%, код 20%.</span>
        </div>
        <div className={styles.field}>
          <ConditionalLabel htmlFor="campaign-promo-url" required={linkBonus > 0}>
            Рекламная ссылка
          </ConditionalLabel>
          <input
            id="campaign-promo-url"
            type="url"
            placeholder="https://example.com/?utm_source=offer"
            maxLength={1024}
            onChange={editor.setField}
            disabled={locked}
            {...inputProps(editor, 'promoUrl')}
          />
          <FieldError>{errors.promoUrl}</FieldError>
          <span className={ui.hint}>
            Одна на всех креаторов: её ставят в ссылки профиля или канала. Проверяем адрес целиком,
            вместе с параметрами.{locked ? ' Креаторы уже взяли оффер — ссылку не поменять.' : ''}
          </span>
        </div>
        <div className={styles.field}>
          <ConditionalLabel htmlFor="campaign-promo-code" required={promoBonus > 0}>
            Промокод
          </ConditionalLabel>
          <input
            id="campaign-promo-code"
            type="text"
            placeholder="OFFER20"
            maxLength={64}
            onChange={editor.setField}
            disabled={locked}
            {...inputProps(editor, 'promoCode')}
          />
          <FieldError>{errors.promoCode}</FieldError>
          <span className={ui.hint}>
            Многоразовый и общий для всех. Проверьте, что он действительно работает у вас на сайте.
          </span>
        </div>
        <div className={styles.field}>
          <label className={ui.label} htmlFor="campaign-retention">
            Держать ссылку и закреп, дней
          </label>
          <IntInput editor={editor} id="campaign-retention" name="retentionDays" />
          <FieldError>{errors.retentionDays}</FieldError>
          <span className={ui.hint}>
            После подачи работы. Пусто — {DEFAULT_RETENTION_DAYS} дней. Надбавки засчитываются в конце срока.
          </span>
        </div>
        <div className={styles.field}>
          <label className={ui.label} htmlFor="campaign-max-reward">
            Не больше за один ролик
          </label>
          <MoneyInput editor={editor} id="campaign-max-reward" name="maxRewardRub" />
          <FieldError>{errors.maxRewardRub}</FieldError>
          <span className={ui.hint}>Пусто — без потолка.</span>
        </div>
      </div>
      <div className={styles.field}>
        <label className={ui.label} htmlFor="campaign-promo-benefit">
          Что даёт промокод
        </label>
        <input
          id="campaign-promo-benefit"
          type="text"
          placeholder="−20% на первый месяц, до 31 декабря"
          maxLength={2000}
          onChange={editor.setField}
          {...inputProps(editor, 'promoBenefit')}
        />
        <span className={ui.hint}>
          {code
            ? `Креатор получит готовый комментарий: «${commentTemplate({ code, benefit: form.promoBenefit.trim(), withLink: linkBonus > 0 })}»`
            : 'Попадёт в готовый текст комментария для креатора.'}
        </span>
      </div>
      {base > 0 && (linkBonus > 0 || promoBonus > 0) && (
        <div className={styles.field}>
          <span className={ui.label}>Что увидят креаторы — за 1 000 просмотров</span>
          <PlacementRates
            rates={{
              base,
              link: form.promoUrl.trim() ? linkBonus : 0,
              promo: code ? promoBonus : 0,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const STEP_FIELDS = {
  brief: BriefFields,
  terms: TermsFields,
  budget: BudgetFields,
};
