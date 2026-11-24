import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Icon from '../shared/Icon/Icon';
import Skeleton, { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import { errorMessage } from '../../shared/auth';
import ui from '../../shared/ui.module.css';
import styles from './Studio.module.css';
import BannerStage from './BannerStage';
import { useSession } from '../../shared/session';
import {
  DEFAULT_SETTINGS,
  FORMAT_LABELS,
  QUICK_STARTS,
  STATUS_LABELS,
  formatBytes,
  formatDateTime,
  formatTimecode,
  isVideoFile,
  parseTimecode,
  studioApi,
} from './studioApi';

const FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'В работе' },
  { key: 'done', label: 'Готово' },
  { key: 'failed', label: 'Ошибки' },
];

const chipClass = (active) => `${ui.chip} ${active ? ui.chipActive : ''}`;

/** Ряд переключателей-чипов */
const Choice = ({ value, options, onChange }) => (
  <div className={ui.chips}>
    {options.map(([key, label]) => (
      <button key={key} type="button" className={chipClass(value === key)} onClick={() => onChange(key)}>
        {label}
      </button>
    ))}
  </div>
);

const Row = ({ label, children, hint }) => (
  <div className={styles.row}>
    <span className={ui.label}>{label}</span>
    {children}
    {hint && <span className={ui.hint}>{hint}</span>}
  </div>
);

const Range = ({ value, min, max, step = 1, onChange, suffix = '%' }) => (
  <div className={styles.range}>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    <span className={styles.rangeValue}>
      {value}
      {suffix}
    </span>
  </div>
);

const Studio = () => {
  const [overview, setOverview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [source, setSource] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [banner, setBanner] = useState({ file: null, assetId: null });
  const [background, setBackground] = useState({ file: null, assetId: null });
  const [captions, setCaptions] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [busy, setBusy] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const session = useSession();
  const [linkUrl, setLinkUrl] = useState(null);
  const [linking, setLinking] = useState(false);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  const set = (patch) => setSettings((current) => ({ ...current, ...patch }));

  const loadJobs = useCallback(
    (which = filter) =>
      studioApi
        .jobs(which)
        .then(setJobs)
        .catch(() => {}),
    [filter]
  );

  const reloadLibrary = useCallback(
    () =>
      Promise.all([studioApi.templates(), studioApi.assets()]).then(([t, a]) => {
        setTemplates(t);
        setAssets(a);
      }),
    []
  );

  const reloadOverview = useCallback(() => studioApi.overview().then(setOverview), []);

  useEffect(() => {
    let alive = true;
    Promise.all([studioApi.overview(), studioApi.jobs('all'), studioApi.templates(), studioApi.assets()])
      .then(([o, j, t, a]) => {
        if (!alive) return;
        setOverview(o);
        setJobs(j);
        setTemplates(t);
        setAssets(a);
      })
      .catch((err) => alive && setPageError(errorMessage(err, 'Не удалось загрузить видео-студию')))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) loadJobs(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Пока есть задачи в работе — обновляем прогресс
  const hasActive = jobs.some((job) => job.status === 'QUEUED' || job.status === 'RUNNING');
  useEffect(() => {
    if (!hasActive) return undefined;
    const timer = setInterval(() => {
      loadJobs();
      reloadOverview().catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [hasActive, loadJobs, reloadOverview]);

  // Ссылку в бота получаем заранее: кнопка — обычная ссылка, браузер не блокирует её как всплывающее окно
  const needsLink = Boolean(overview?.telegram?.botEnabled && !overview?.telegram?.linked);
  useEffect(() => {
    if (!needsLink) {
      setLinkUrl(null);
      return undefined;
    }
    let timer;
    let cancelled = false;
    const load = () =>
      studioApi
        .linkTelegram()
        .then((link) => {
          if (cancelled) return;
          setLinkUrl(link.url);
          // Обновляем за пару минут до истечения кода
          const left = new Date(link.expiresAt).getTime() - Date.now() - 2 * 60 * 1000;
          timer = setTimeout(load, Math.max(left, 30 * 1000));
        })
        .catch(() => {
          if (!cancelled) timer = setTimeout(load, 30 * 1000);
        });
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [needsLink]);

  // После нажатия Start в боте статус подтягивается сам
  useEffect(() => {
    if (!linking) return undefined;
    const check = () =>
      studioApi
        .overview()
        .then((o) => {
          setOverview(o);
          if (o.telegram.linked) {
            setLinking(false);
            toast.success('Telegram привязан');
          }
        })
        .catch(() => {});
    const timer = setInterval(check, 3000);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
    };
  }, [linking]);

  useEffect(() => {
    if (!source) {
      setSourceUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(source);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [source]);

  const bannerAssets = useMemo(() => assets.filter((a) => a.kind === 'BANNER'), [assets]);
  const bannerFileUrl = useMemo(() => (banner.file ? URL.createObjectURL(banner.file) : ''), [banner.file]);
  useEffect(() => () => bannerFileUrl && URL.revokeObjectURL(bannerFileUrl), [bannerFileUrl]);
  const bannerAsset = banner.assetId ? assets.find((a) => a.id === banner.assetId) : null;
  const bannerPreview = banner.file
    ? { url: bannerFileUrl, video: banner.file.type.startsWith('video/') }
    : bannerAsset?.url
      ? { url: bannerAsset.url, video: bannerAsset.video }
      : null;
  const backgroundAssets = useMemo(
    () => assets.filter((a) => a.kind === 'BACKGROUND' || (settings.splitPlace !== 'off' && a.video)),
    [assets, settings.splitPlace]
  );

  const pickSource = (file) => {
    if (!file) return;
    if (!isVideoFile(file)) {
      toast.error('Исходник — видео MP4, MOV, WebM или MKV');
      return;
    }
    if (overview && !overview.unlimited && file.size > overview.sourceMaxBytes) {
      toast.error(`Исходник — до ${Math.round(overview.sourceMaxBytes / 1024 / 1024)} МиБ`);
      return;
    }
    setSource(file);
    set({ sourceStart: 0, sourceEnd: null });
  };

  const applyQuickStart = (quick) => {
    setSettings((current) => ({
      ...current,
      splitPlace: 'off',
      shape: 'fit',
      sizeLimit: 0,
      ...quick.patch,
    }));
  };

  const markFromPreview = (field) => {
    const time = videoRef.current?.currentTime;
    if (time == null) return;
    set({ [field]: Math.round(time * 10) / 10 });
  };

  const loadCaptionsFile = async (file) => {
    if (!file) return;
    if (file.size > 256 * 1024) {
      toast.error('Субтитры — до 256 КБ');
      return;
    }
    const buffer = await file.arrayBuffer();
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      text = new TextDecoder('windows-1251').decode(buffer);
    }
    setCaptions(text.replace(/^﻿/, ''));
  };

  const downloadSrt = () => {
    const text = captions.includes('-->')
      ? captions
      : `1\n00:00:00,000 --> 00:59:59,000\n${captions.trim()}\n`;
    const blob = new Blob([text], { type: 'application/x-subrip' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'captions.srt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /** Свежий файл баннера/фона: загрузка и при необходимости сохранение в библиотеку */
  const prepareMedia = async (media, purpose, kind, forceLibrary) => {
    if (media.assetId) return { assetId: media.assetId };
    if (!media.file) return {};
    const key = await studioApi.upload(media.file, purpose);
    if (saveToLibrary || forceLibrary) {
      const asset = await studioApi.saveAsset({ key, kind, name: media.file.name.slice(0, 120), shared: false });
      return { assetId: asset.id, key: null };
    }
    return { key };
  };

  const needsBanner = settings.mode !== 'none';
  const needsBackground = settings.background === 'file';

  const submit = async () => {
    if (!source) {
      toast.error('Выберите исходное видео');
      return;
    }
    if (needsBanner && !banner.file && !banner.assetId) {
      toast.error('Добавьте баннер');
      return;
    }
    if (needsBackground && !background.file && !background.assetId) {
      toast.error(settings.splitPlace !== 'off' ? 'Добавьте второе видео' : 'Добавьте фон');
      return;
    }
    setBusy('submit');
    try {
      setUploadProgress(0);
      const sourceKey = await studioApi.upload(source, 'SOURCE', setUploadProgress);
      setUploadProgress(null);
      const b = needsBanner ? await prepareMedia(banner, 'BANNER', 'BANNER', false) : {};
      const bg = needsBackground ? await prepareMedia(background, 'BACKGROUND', 'BACKGROUND', false) : {};
      const created = await studioApi.createJobs({
        sourceKey,
        filename: source.name,
        settings,
        captions: captions.trim() || null,
        bannerKey: b.key || null,
        bannerAssetId: b.assetId || null,
        backgroundKey: bg.key || null,
        backgroundAssetId: bg.assetId || null,
      });
      const queued = created.length > 1 ? `Пакет из ${created.length} MP4 в очереди` : 'Видео в очереди';
      if (needsLink) {
        toast(`${queued}. Привяжите Telegram — готовый ролик придёт в чат.`, { icon: '📲', duration: 6000 });
      } else {
        toast.success(overview?.telegram?.linked ? `${queued} — готовый ролик придёт в Telegram` : queued);
      }
      if (b.assetId) setBanner({ file: null, assetId: b.assetId });
      if (bg.assetId) setBackground({ file: null, assetId: bg.assetId });
      setFilter('all');
      await Promise.all([loadJobs('all'), reloadOverview(), reloadLibrary()]);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось поставить видео в очередь'));
    } finally {
      setBusy('');
      setUploadProgress(null);
    }
  };

  const saveTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      toast.error('Назовите шаблон');
      return;
    }
    if (needsBanner && !banner.file && !banner.assetId) {
      toast.error('Добавьте баннер');
      return;
    }
    if (needsBackground && !background.file && !background.assetId) {
      toast.error('Добавьте фон');
      return;
    }
    setBusy('template');
    try {
      // Шаблон хранит ссылки на файлы библиотеки — свежие файлы сохраняем туда
      const b = needsBanner ? await prepareMedia(banner, 'BANNER', 'BANNER', true) : {};
      const bg = needsBackground ? await prepareMedia(background, 'BACKGROUND', 'BACKGROUND', true) : {};
      const body = {
        name,
        settings,
        captions: captions.trim() || null,
        bannerAssetId: b.assetId || null,
        backgroundAssetId: bg.assetId || null,
      };
      if (editingTemplate) {
        await studioApi.updateTemplate(editingTemplate, body);
        toast.success('Шаблон обновлён');
      } else {
        await studioApi.createTemplate(body);
        toast.success('Шаблон сохранён');
      }
      if (b.assetId) setBanner({ file: null, assetId: b.assetId });
      if (bg.assetId) setBackground({ file: null, assetId: bg.assetId });
      await reloadLibrary();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сохранить шаблон'));
    } finally {
      setBusy('');
    }
  };

  const applyTemplate = (template) => {
    setSettings({ ...DEFAULT_SETTINGS, ...template.settings });
    setCaptions(template.captions || '');
    setBanner({ file: null, assetId: template.bannerAssetId });
    setBackground({ file: null, assetId: template.backgroundAssetId });
    setTemplateName(template.name);
    setEditingTemplate(template.id);
    toast.success(`Шаблон «${template.name}» загружен в редактор`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const run = async (key, action, success) => {
    setBusy(key);
    try {
      await action();
      if (success) toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err, 'Не получилось'));
    } finally {
      setBusy('');
    }
  };

  const jobAction = (job, kind) => {
    const actions = {
      cancel: () => studioApi.cancel(job.id),
      retry: () => studioApi.retry(job.id),
      retry720: () => studioApi.retry(job.id, '720'),
      telegram: () => studioApi.sendToTelegram(job.id),
    };
    const messages = {
      cancel: 'Задача отменена',
      retry: 'Повтор в очереди',
      retry720: 'Экспорт 720p в очереди',
      telegram: 'Отправлено в Telegram',
    };
    return run(
      `${kind}:${job.id}`,
      async () => {
        await actions[kind]();
        await Promise.all([loadJobs(), reloadOverview()]);
      },
      messages[kind]
    );
  };


  if (loading) {
    return (
      <div className={ui.page} aria-busy="true">
        <SkeletonPageHead eyebrow="Монтаж роликов" title="Видео-студия" />
        <Skeleton block height={420} radius="var(--card-radius)" />
      </div>
    );
  }

  if (pageError && !overview) {
    return (
      <div className={ui.page}>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  const telegram = overview.telegram;
  const quota = overview.unlimited ? 'Без лимита' : `Осталось сегодня: ${overview.remaining} из ${overview.dailyLimit}`;
  const isSplit = settings.splitPlace !== 'off';
  const activeTemplate = templates.find((t) => t.active);

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Монтаж роликов</span>
          <h1 className={ui.title}>Видео-студия</h1>
          <p className={ui.subtitle}>
            Баннер, фон, субтитры и формат для коротких видео — здесь и в Telegram-боте. {quota}
          </p>
        </div>
      </header>

      {!overview.rendererAvailable && (
        <p className={ui.errorBanner}>
          Сервер рендера сейчас недоступен: задачи встанут в очередь и соберутся, когда он вернётся.
        </p>
      )}

      <section className={`${ui.card} ${styles.telegram}`}>
        <div className={styles.telegramText}>
          <span className={ui.cardTitle}>Telegram-бот</span>
          {!telegram.botEnabled && <p className={ui.muted}>Бот ещё не подключён — пока монтаж доступен только на сайте.</p>}
          {telegram.botEnabled && telegram.linked && (
            <p className={ui.muted}>
              Привязан{telegram.telegramUsername ? ` @${telegram.telegramUsername}` : ''}. Готовые ролики с сайта приходят в чат.
              Пришлите боту видео — он смонтирует его{' '}
              {activeTemplate ? `по шаблону «${activeTemplate.name}»` : 'в выбранном режиме'}.
            </p>
          )}
          {telegram.botEnabled && !telegram.linked && (
            <p className={ui.muted}>
              Привяжите Telegram — готовые ролики будут сразу приходить вам в чат, а монтировать можно будет прямо оттуда.
              {linking && ' Нажмите «Start» в боте — статус обновится сам.'}
            </p>
          )}
        </div>
        <div className={styles.telegramActions}>
          {telegram.botEnabled && !telegram.linked && (
            linkUrl ? (
              <a
                className={ui.btnPrimary}
                href={linkUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setLinking(true)}
              >
                {linking ? 'Открыть бота ещё раз' : 'Привязать Telegram'}
              </a>
            ) : (
              <button type="button" className={ui.btnPrimary} disabled>
                Привязать Telegram
              </button>
            )
          )}
          {telegram.botEnabled && telegram.linked && (
            <>
              <select
                className={ui.input}
                value={activeTemplate?.id || ''}
                onChange={(e) =>
                  run(
                    'active',
                    async () => {
                      await studioApi.setActiveTemplate(e.target.value || null);
                      await reloadLibrary();
                    },
                    e.target.value ? 'Автошаблон включён' : 'Автошаблон выключен'
                  )
                }
              >
                <option value="">Автошаблон выключен</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    Автошаблон: {t.name}
                  </option>
                ))}
              </select>
              {telegram.botUrl && (
                <a className={ui.btnSecondary} href={telegram.botUrl} target="_blank" rel="noreferrer">
                  Открыть бота
                </a>
              )}
              {!session.user?.telegramOnly && (
                <button
                  type="button"
                  className={ui.btnGhost}
                  onClick={() =>
                    run(
                      'unlink',
                      async () => {
                        await studioApi.unlinkTelegram();
                        await reloadOverview();
                      },
                      'Telegram отвязан'
                    )
                  }
                >
                  Отвязать
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <div className={styles.layout}>
        <section className={`${ui.card} ${styles.editor}`}>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionTitle}>Новый ролик</h2>
            {editingTemplate && (
              <button
                type="button"
                className={ui.linkMuted}
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateName('');
                  setSettings(DEFAULT_SETTINGS);
                  setCaptions('');
                  setBanner({ file: null, assetId: null });
                  setBackground({ file: null, assetId: null });
                }}
              >
                Сбросить шаблон
              </button>
            )}
          </div>

          <div
            className={`${styles.drop} ${dragOver ? styles.dropActive : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickSource(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv,.mov"
              hidden
              onChange={(e) => pickSource(e.target.files?.[0])}
            />
            {source ? (
              <span>
                <strong>{source.name}</strong> · {formatBytes(source.size)} — нажмите, чтобы заменить
              </span>
            ) : (
              <span>
                Перетащите исходное видео или <strong>выберите файл</strong>
                <br />
                <span className={ui.muted}>MP4, MOV, WebM, MKV · до 80 МиБ и 120 секунд</span>
              </span>
            )}
          </div>

          {sourceUrl && (
            <div className={styles.preview}>
              <video ref={videoRef} src={sourceUrl} controls playsInline />
            </div>
          )}

          <Row label="Быстрый старт">
            <div className={styles.quick}>
              {QUICK_STARTS.map((quick) => (
                <button key={quick.key} type="button" className={styles.quickItem} onClick={() => applyQuickStart(quick)}>
                  <strong>{quick.label}</strong>
                  <span>{quick.hint}</span>
                </button>
              ))}
            </div>
          </Row>

          <details className={styles.group}>
            <summary>Обрезка и звук</summary>
            <div className={styles.grid2}>
              <Row label="Начало">
                <div className={styles.inline}>
                  <input
                    className={ui.input}
                    defaultValue={formatTimecode(settings.sourceStart)}
                    key={`s${settings.sourceStart}`}
                    placeholder="0:00"
                    onBlur={(e) => {
                      const value = parseTimecode(e.target.value);
                      if (Number.isNaN(value)) toast.error('Время — в виде 0:05 или 5.5');
                      else set({ sourceStart: value ?? 0 });
                    }}
                  />
                  {sourceUrl && (
                    <button type="button" className={ui.btnSecondary} onClick={() => markFromPreview('sourceStart')}>
                      Из кадра
                    </button>
                  )}
                </div>
              </Row>
              <Row label="Конец">
                <div className={styles.inline}>
                  <input
                    className={ui.input}
                    defaultValue={formatTimecode(settings.sourceEnd)}
                    key={`e${settings.sourceEnd}`}
                    placeholder="до конца"
                    onBlur={(e) => {
                      const value = parseTimecode(e.target.value);
                      if (Number.isNaN(value)) toast.error('Время — в виде 0:20 или 20');
                      else set({ sourceEnd: value });
                    }}
                  />
                  {sourceUrl && (
                    <button type="button" className={ui.btnSecondary} onClick={() => markFromPreview('sourceEnd')}>
                      Из кадра
                    </button>
                  )}
                </div>
              </Row>
            </div>
            <Row label="Громкость исходника">
              <Range value={settings.sourceVolume} min={0} max={100} onChange={(v) => set({ sourceVolume: v })} />
            </Row>
            <label className={styles.check}>
              <input type="checkbox" checked={settings.keepSource} onChange={(e) => set({ keepSource: e.target.checked })} />
              Сохранить исходники для повтора (24 часа)
            </label>
          </details>

          <details className={styles.group} open>
            <summary>Формат и экспорт</summary>
            <Row label="Кадр">
              <Choice
                value={settings.format}
                options={Object.entries(FORMAT_LABELS)}
                onChange={(format) => set({ format })}
              />
            </Row>
            <div className={styles.grid2}>
              <Row label="Качество">
                <Choice value={settings.quality} options={[['720', '720p'], ['1080', '1080p']]} onChange={(quality) => set({ quality })} />
              </Row>
              <Row label="Предел размера">
                <Choice
                  value={settings.sizeLimit}
                  options={[[0, 'Нет'], [10, '10 МБ'], [25, '25 МБ'], [49, '49 МБ']]}
                  onChange={(sizeLimit) => set({ sizeLimit })}
                />
              </Row>
            </div>
            <Row label="Варианты" hint="«9:16 + 1:1» собирает два MP4 и тратит две задачи">
              <Choice
                value={settings.exportProfile}
                options={[['single', 'Один формат'], ['vertical_square', '9:16 + 1:1']]}
                onChange={(exportProfile) => set({ exportProfile })}
              />
            </Row>
          </details>

          <details className={styles.group} open={settings.background !== 'off'}>
            <summary>Фон и компоновка</summary>
            <Row label="Фон">
              <Choice
                value={isSplit ? 'split' : settings.background}
                options={[
                  ['off', 'Без фона'],
                  ['blur', 'Размытие'],
                  ['color', 'Цвет'],
                  ['preset', 'Встроенный'],
                  ['file', 'Свой файл'],
                  ['split', 'Два видео'],
                ]}
                onChange={(value) =>
                  value === 'split'
                    ? set({ background: 'file', splitPlace: 'top' })
                    : set({ background: value, splitPlace: 'off' })
                }
              />
            </Row>
            {settings.background === 'color' && (
              <Row label="Цвет">
                <input type="color" value={settings.color} onChange={(e) => set({ color: e.target.value })} />
              </Row>
            )}
            {settings.background === 'preset' && (
              <div className={styles.presets}>
                <button
                  type="button"
                  className={`${styles.preset} ${styles.presetRandom} ${settings.preset === 'random' ? styles.presetActive : ''}`}
                  onClick={() => set({ preset: 'random' })}
                >
                  Случайный
                </button>
                {overview.presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.name}
                    className={`${styles.preset} ${settings.preset === preset.id ? styles.presetActive : ''}`}
                    style={{ backgroundImage: `url(${preset.url})` }}
                    onClick={() => set({ preset: preset.id })}
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            )}
            {settings.background === 'file' && (
              <MediaPicker
                label={isSplit ? 'Второе видео' : 'Файл фона'}
                accept={isSplit ? 'video/*' : 'video/*,image/png,image/jpeg,image/webp'}
                media={background}
                onChange={setBackground}
                assets={backgroundAssets}
              />
            )}
            {isSplit ? (
              <>
                <div className={styles.grid2}>
                  <Row label="Основное видео">
                    <Choice
                      value={settings.splitPlace}
                      options={[['top', 'Сверху'], ['bottom', 'Снизу']]}
                      onChange={(splitPlace) => set({ splitPlace })}
                    />
                  </Row>
                  <Row label="Кадрирование">
                    <Choice
                      value={settings.splitFit}
                      options={[['fill', 'Заполнить'], ['fit', 'Целиком']]}
                      onChange={(splitFit) => set({ splitFit })}
                    />
                  </Row>
                </div>
                <Row label="Доля основного видео">
                  <Range value={settings.splitShare} min={30} max={70} step={5} onChange={(v) => set({ splitShare: v })} />
                </Row>
              </>
            ) : (
              settings.background !== 'off' && (
                <div className={styles.grid2}>
                  <Row label="Передний план">
                    <Choice
                      value={settings.shape}
                      options={[['fit', 'Прямоугольник'], ['circle', 'Круг']]}
                      onChange={(shape) => set({ shape })}
                    />
                  </Row>
                  <Row label="Масштаб">
                    <Range value={settings.scale} min={35} max={100} onChange={(v) => set({ scale: v })} />
                  </Row>
                </div>
              )
            )}
          </details>

          <details className={styles.group} open={settings.mode !== 'none'}>
            <summary>Баннер</summary>
            <Row label="Режим">
              <Choice
                value={settings.mode}
                options={[['none', 'Нет'], ['overlay', 'Поверх видео'], ['strip', 'Полоса'], ['pause', 'Пауза']]}
                onChange={(mode) =>
                  set({
                    mode,
                    size: null,
                    bannerX: null,
                    bannerY: null,
                    place: mode === 'strip' && settings.place === 'center' ? 'bottom' : settings.place,
                  })
                }
              />
            </Row>
            {settings.mode !== 'none' && (
              <>
                <MediaPicker
                  label="Файл баннера"
                  accept="video/*,image/png,image/jpeg,image/webp"
                  media={banner}
                  onChange={setBanner}
                  assets={bannerAssets}
                />
                {settings.mode !== 'pause' && (
                  <div className={styles.grid2}>
                    <Row label="Положение">
                      <Choice
                        value={settings.mode === 'overlay' && settings.bannerX != null ? '' : settings.place}
                        options={
                          settings.mode === 'strip'
                            ? [['top', 'Сверху'], ['bottom', 'Снизу']]
                            : [['top', 'Сверху'], ['center', 'По центру'], ['bottom', 'Снизу']]
                        }
                        onChange={(place) => set({ place, bannerX: null, bannerY: null })}
                      />
                    </Row>
                    <Row label={settings.mode === 'strip' ? 'Высота полосы' : 'Ширина баннера'}>
                      <Range
                        value={settings.size ?? (settings.mode === 'strip' ? 20 : 90)}
                        min={settings.mode === 'strip' ? 10 : 15}
                        max={settings.mode === 'strip' ? 45 : 100}
                        onChange={(size) => set({ size })}
                      />
                    </Row>
                  </div>
                )}
                {settings.mode === 'overlay' && bannerPreview && (
                  <BannerStage
                    videoUrl={sourceUrl}
                    bannerUrl={bannerPreview.url}
                    bannerIsVideo={bannerPreview.video}
                    settings={settings}
                    onChange={set}
                  />
                )}
                {settings.mode === 'overlay' && (
                  <Row label="Выравнивание">
                    <Choice
                      value={settings.bannerX != null ? '' : settings.align}
                      options={[['left', 'Слева'], ['center', 'По центру'], ['right', 'Справа']]}
                      onChange={(align) => set({ align, bannerX: null, bannerY: null })}
                    />
                  </Row>
                )}
                {settings.mode === 'strip' && (
                  <Row label="Цвет полосы">
                    <input type="color" value={settings.stripColor} onChange={(e) => set({ stripColor: e.target.value })} />
                  </Row>
                )}
                {settings.mode !== 'strip' && (
                  <div className={styles.grid2}>
                    <Row label={settings.mode === 'pause' ? 'Вставка, сек' : 'Начало, сек'}>
                      <input
                        className={ui.input}
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder={settings.mode === 'pause' ? 'середина' : '0'}
                        value={settings.start ?? ''}
                        onChange={(e) => set({ start: e.target.value === '' ? null : Number(e.target.value) })}
                      />
                    </Row>
                    <Row label="Длительность, сек">
                      <input
                        className={ui.input}
                        type="number"
                        min={0.5}
                        step={0.1}
                        placeholder={settings.mode === 'pause' ? 'как у баннера' : 'до конца'}
                        value={settings.duration ?? ''}
                        onChange={(e) => set({ duration: e.target.value === '' ? null : Number(e.target.value) })}
                      />
                    </Row>
                  </div>
                )}
                <Row label="Непрозрачность">
                  <Range value={settings.opacity} min={10} max={100} onChange={(opacity) => set({ opacity })} />
                </Row>
                {settings.mode === 'overlay' && (
                  <div className={styles.grid2}>
                    <Row label="Затемнение кадра">
                      <Range value={settings.overlayDim} min={0} max={100} onChange={(overlayDim) => set({ overlayDim })} />
                    </Row>
                    <Row label="Приглушить исходник">
                      <Range value={settings.overlayDuck} min={0} max={100} onChange={(overlayDuck) => set({ overlayDuck })} />
                    </Row>
                  </div>
                )}
                <div className={styles.checks}>
                  <label className={styles.check}>
                    <input type="checkbox" checked={settings.green} onChange={(e) => set({ green: e.target.checked })} />
                    Убрать зелёный фон
                  </label>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={settings.bannerAudio ?? settings.mode === 'pause'}
                      onChange={(e) => set({ bannerAudio: e.target.checked })}
                    />
                    Звук баннера
                  </label>
                  <label className={styles.check}>
                    <input type="checkbox" checked={settings.bannerLoop} onChange={(e) => set({ bannerLoop: e.target.checked })} />
                    Зациклить видеобаннер
                  </label>
                </div>
              </>
            )}
          </details>

          <details className={styles.group} open={Boolean(captions)}>
            <summary>Субтитры</summary>
            <textarea
              className={`${ui.input} ${ui.textarea} ${styles.captions}`}
              value={captions}
              onChange={(e) => setCaptions(e.target.value)}
              placeholder={'Текст на весь ролик или SRT/VTT:\n1\n00:00:01,000 --> 00:00:03,000\nПервая фраза'}
            />
            <div className={styles.inline}>
              <label className={ui.btnSecondary}>
                Загрузить SRT/VTT
                <input type="file" accept=".srt,.vtt,text/vtt" hidden onChange={(e) => loadCaptionsFile(e.target.files?.[0])} />
              </label>
              {captions.trim() && (
                <button type="button" className={ui.btnGhost} onClick={downloadSrt}>
                  Скачать SRT
                </button>
              )}
            </div>
            <div className={styles.grid2}>
              <Row label="Стиль">
                <Choice
                  value={settings.captionStyle}
                  options={[['outline', 'Белый с обводкой'], ['yellow', 'Жёлтый'], ['box', 'Плашка']]}
                  onChange={(captionStyle) => set({ captionStyle })}
                />
              </Row>
              <Row label="Размер">
                <Choice
                  value={settings.captionSize}
                  options={[['small', 'S'], ['medium', 'M'], ['large', 'L']]}
                  onChange={(captionSize) => set({ captionSize })}
                />
              </Row>
              <Row label="Положение">
                <Choice
                  value={settings.captionPosition}
                  options={[['bottom', 'Снизу'], ['top', 'Сверху']]}
                  onChange={(captionPosition) => set({ captionPosition })}
                />
              </Row>
              <Row label="Таймкоды относительно">
                <Choice
                  value={settings.captionClock}
                  options={[['output', 'Готового ролика'], ['source', 'Исходника']]}
                  onChange={(captionClock) => set({ captionClock })}
                />
              </Row>
            </div>
            {isSplit && (
              <Row label="Область субтитров">
                <Choice
                  value={settings.captionScope}
                  options={[['main', 'Основное видео'], ['frame', 'Весь кадр']]}
                  onChange={(captionScope) => set({ captionScope })}
                />
              </Row>
            )}
          </details>

          {(banner.file || background.file) && (
            <label className={styles.check}>
              <input type="checkbox" checked={saveToLibrary} onChange={(e) => setSaveToLibrary(e.target.checked)} />
              Сохранить загруженные баннер и фон в библиотеку
            </label>
          )}

          <div className={styles.submit}>
            <button type="button" className={`${ui.btnPrimary} ${ui.btnLarge}`} disabled={Boolean(busy)} onClick={submit}>
              {busy === 'submit'
                ? uploadProgress != null
                  ? `Загрузка ${uploadProgress}%`
                  : 'Ставлю в очередь…'
                : 'Собрать видео'}
            </button>
            <div className={styles.templateSave}>
              <input
                className={ui.input}
                placeholder="Название шаблона"
                maxLength={80}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button type="button" className={ui.btnSecondary} disabled={Boolean(busy)} onClick={saveTemplate}>
                {editingTemplate ? 'Обновить шаблон' : 'Сохранить шаблон'}
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.side}>
          <section className={ui.card}>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionTitle}>Шаблоны монтажа</h2>
            </div>
            {templates.length === 0 ? (
              <p className={ui.muted}>
                Настройте монтаж и сохраните его — шаблон можно применить на сайте или включить автошаблоном для видео из
                Telegram.
              </p>
            ) : (
              <ul className={styles.list}>
                {templates.map((t) => (
                  <li key={t.id} className={styles.listItem}>
                    <button type="button" className={styles.listMain} onClick={() => applyTemplate(t)}>
                      <strong>
                        {t.favorite ? '★ ' : ''}
                        {t.name}
                      </strong>
                      <span className={ui.muted}>
                        {FORMAT_LABELS[t.settings.format] || t.settings.format}
                        {t.settings.exportProfile === 'vertical_square' ? ' + 1:1' : ''} · {t.settings.quality}p
                        {t.active ? ' · автошаблон' : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={ui.btnGhost}
                      title={t.favorite ? 'Убрать из избранного' : 'В избранное (первым в боте)'}
                      onClick={() =>
                        run('fav', async () => {
                          await studioApi.setActiveTemplate(t.favorite ? null : t.id, true);
                          await reloadLibrary();
                        })
                      }
                    >
                      {t.favorite ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      className={ui.btnGhost}
                      title="Удалить"
                      onClick={() =>
                        window.confirm(`Удалить шаблон «${t.name}»?`) &&
                        run(
                          'del',
                          async () => {
                            await studioApi.deleteTemplate(t.id);
                            if (editingTemplate === t.id) setEditingTemplate(null);
                            await reloadLibrary();
                          },
                          'Шаблон удалён'
                        )
                      }
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={ui.card}>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionTitle}>Библиотека</h2>
            </div>
            {assets.length === 0 ? (
              <p className={ui.muted}>Сохранённые баннеры и фоны появятся здесь.</p>
            ) : (
              <ul className={styles.list}>
                {assets.map((a) => (
                  <li key={a.id} className={styles.listItem}>
                    <a className={styles.listMain} href={a.url} target="_blank" rel="noreferrer">
                      <strong>{a.name}</strong>
                      <span className={ui.muted}>
                        {a.kind === 'BANNER' ? 'Баннер' : 'Фон'} · {a.video ? 'видео' : 'картинка'} · {formatBytes(a.sizeBytes)}
                        {a.shared ? ' · общий каталог' : ''}
                      </span>
                    </a>
                    {(a.own || (a.shared && overview.admin)) && (
                      <button
                        type="button"
                        className={ui.btnGhost}
                        title="Удалить"
                        onClick={() =>
                          window.confirm(`Удалить «${a.name}» из библиотеки?`) &&
                          run(
                            'asset',
                            async () => {
                              await studioApi.deleteAsset(a.id);
                              await reloadLibrary();
                            },
                            'Файл удалён'
                          )
                        }
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {overview.admin && <AdminUpload onSaved={reloadLibrary} />}
          </section>
        </aside>
      </div>

      <section className={ui.card}>
        <div className={ui.sectionHead}>
          <h2 className={ui.sectionTitle}>Мои видео</h2>
          <div className={ui.chips}>
            {FILTERS.map((f) => (
              <button key={f.key} type="button" className={chipClass(filter === f.key)} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {jobs.length === 0 ? (
          <p className={ui.muted}>Здесь появятся ролики с сайта и из Telegram. Готовый файл хранится 48 часов.</p>
        ) : (
          <ul className={styles.jobs}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} busy={busy} onAction={jobAction} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

/** Файл баннера/фона: новый файл или из библиотеки */
const MediaPicker = ({ label, accept, media, onChange, assets }) => (
  <Row label={label}>
    <div className={styles.inline}>
      <label className={ui.btnSecondary}>
        {media.file ? media.file.name.slice(0, 32) : 'Загрузить файл'}
        <input
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange({ file, assetId: null });
          }}
        />
      </label>
      {assets.length > 0 && (
        <select
          className={ui.input}
          value={media.assetId || ''}
          onChange={(e) => onChange({ file: null, assetId: e.target.value || null })}
        >
          <option value="">Из библиотеки…</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.shared ? 'Каталог: ' : ''}
              {a.name}
            </option>
          ))}
        </select>
      )}
    </div>
  </Row>
);

/** Админ пополняет общий каталог фонов, баннеров и вторых видео */
const AdminUpload = ({ onSaved }) => {
  const [file, setFile] = useState(null);
  const [kind, setKind] = useState('BACKGROUND');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const key = await studioApi.upload(file, kind);
      await studioApi.saveAsset({ key, kind, name: file.name.slice(0, 120), shared: true });
      toast.success('Добавлено в общий каталог');
      setFile(null);
      await onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось добавить файл'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.admin}>
      <span className={ui.label}>Общий каталог (админ)</span>
      <div className={styles.inline}>
        <select className={ui.input} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="BACKGROUND">Фон / второе видео</option>
          <option value="BANNER">Баннер</option>
        </select>
        <label className={ui.btnSecondary}>
          {file ? file.name.slice(0, 24) : 'Файл'}
          <input
            type="file"
            accept="video/*,image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <button type="button" className={ui.btnPrimary} disabled={!file || busy} onClick={save}>
          Добавить
        </button>
      </div>
    </div>
  );
};

const JobCard = ({ job, busy, onAction }) => {
  const active = job.status === 'QUEUED' || job.status === 'RUNNING';
  const tone =
    job.status === 'DONE' ? ui.chipSuccess : job.status === 'FAILED' ? ui.chipDanger : active ? ui.chipWarning : ui.chipOutline;
  const s = job.settings || {};
  return (
    <li className={styles.job}>
      <div className={styles.jobHead}>
        <div className={styles.jobTitle}>
          <strong>{job.filename}</strong>
          <span className={ui.muted}>
            {FORMAT_LABELS[s.format] || s.format} · {s.quality}p{job.presetName ? ` · фон «${job.presetName}»` : ''}
            {job.origin === 'TELEGRAM' ? ' · из Telegram' : ''} · {formatDateTime(job.createdAt)}
          </span>
        </div>
        <span className={`${ui.chip} ${tone}`}>
          {STATUS_LABELS[job.status] || job.status}
          {job.status === 'RUNNING' ? ` ${job.progress}%` : ''}
        </span>
      </div>
      {active && (
        <div className={ui.track}>
          <div className={`${ui.fill} ${ui.fillAccent}`} style={{ width: `${job.status === 'RUNNING' ? job.progress : 2}%` }} />
        </div>
      )}
      {job.status === 'QUEUED' && job.queuePosition > 0 && (
        <span className={ui.hint}>Перед вами в очереди: {job.queuePosition}</span>
      )}
      {job.error && <span className={ui.errorText}>{job.error}</span>}
      <div className={styles.jobActions}>
        {job.previewUrl && (
          <a className={ui.btnSecondary} href={job.previewUrl} target="_blank" rel="noreferrer">
            <Icon name="play" size={16} /> Смотреть
          </a>
        )}
        {job.downloadUrl && (
          <a className={ui.btnPrimary} href={job.downloadUrl}>
            <Icon name="download" size={16} /> MP4 {job.resultSize ? `· ${formatBytes(job.resultSize)}` : ''}
          </a>
        )}
        {job.canSendToTelegram && (
          <button
            type="button"
            className={ui.btnSecondary}
            disabled={busy === `telegram:${job.id}`}
            onClick={() => onAction(job, 'telegram')}
          >
            В Telegram
          </button>
        )}
        {active && (
          <button type="button" className={ui.btnGhost} disabled={busy === `cancel:${job.id}`} onClick={() => onAction(job, 'cancel')}>
            Отменить
          </button>
        )}
        {job.retryUntil && (
          <>
            <button type="button" className={ui.btnGhost} disabled={Boolean(busy)} onClick={() => onAction(job, 'retry')}>
              Повторить
            </button>
            {s.quality !== '720' && (
              <button type="button" className={ui.btnGhost} disabled={Boolean(busy)} onClick={() => onAction(job, 'retry720')}>
                В 720p
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default Studio;
