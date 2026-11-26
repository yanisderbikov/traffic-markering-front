import React, { useEffect, useRef, useState } from 'react';
import styles from './BannerStage.module.css';

/** Соотношение сторон готового ролика по формату; source — как у исходника */
const FORMAT_RATIO = { vertical: 9 / 16, portrait: 4 / 5, square: 1, horizontal: 16 / 9 };

const MIN_SIZE = 15;
const MAX_SIZE = 100;
const PLACE_FACTOR = { top: 0.06, center: 0.5, bottom: 0.94 };
const ALIGN_FACTOR = { left: 0.06, center: 0.5, right: 0.94 };

const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Баннер поверх видео: перетаскивается по кадру, за угол меняется размер.
 * Пропорции баннера не меняются — меняется только ширина, высота следует за ней.
 * Геометрия совпадает с рендером: ширина — size% кадра, центр — bannerX/bannerY% кадра, баннер целиком в кадре.
 */
const BannerStage = ({ videoUrl, bannerUrl, bannerIsVideo, settings, onChange }) => {
  const stageRef = useRef(null);
  const drag = useRef(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [videoRatio, setVideoRatio] = useState(16 / 9);
  const [bannerRatio, setBannerRatio] = useState(null);

  const ratio = FORMAT_RATIO[settings.format] || videoRatio;

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    const measure = () => setFrame({ w: node.clientWidth, h: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ratio]);

  useEffect(() => setBannerRatio(null), [bannerUrl]);

  const placed = settings.bannerX != null && settings.bannerY != null;
  const size = settings.size ?? 90;

  /** Размер и положение баннера в пикселях превью — так же, как считает FFmpeg */
  const geometry = (patch = {}) => {
    const s = { ...settings, ...patch };
    const isPlaced = s.bannerX != null && s.bannerY != null;
    const ar = bannerRatio || 1;
    const boxW = (frame.w * (s.size ?? 90)) / 100;
    const boxH = isPlaced ? frame.h : frame.h * 0.7;
    const w = Math.min(boxW, boxH * ar);
    const h = w / ar;
    let left;
    let top;
    if (isPlaced) {
      left = clamp((frame.w * s.bannerX) / 100 - w / 2, 0, frame.w - w);
      top = clamp((frame.h * s.bannerY) / 100 - h / 2, 0, frame.h - h);
    } else {
      left = (frame.w - w) * (ALIGN_FACTOR[s.align] ?? 0.5);
      top = (frame.h - h) * (PLACE_FACTOR[s.place] ?? 0.94);
    }
    return { w, h, left, top };
  };

  const start = (kind) => (e) => {
    if (!frame.w || !bannerRatio) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { kind, x: e.clientX, y: e.clientY, ...geometry() };
  };

  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.kind === 'move') {
      const left = clamp(d.left + dx, 0, frame.w - d.w);
      const top = clamp(d.top + dy, 0, frame.h - d.h);
      onChange({
        bannerX: round1(((left + d.w / 2) / frame.w) * 100),
        bannerY: round1(((top + d.h / 2) / frame.h) * 100),
      });
      return;
    }
    // угол: левый верхний край на месте, ширина по большему из смещений — пропорции сохраняются
    const grow = Math.abs(dx) > Math.abs(dy * bannerRatio) ? dx : dy * bannerRatio;
    const maxW = Math.min(frame.w - d.left, (frame.h - d.top) * bannerRatio, frame.w);
    const minW = (frame.w * MIN_SIZE) / 100;
    const w = clamp(d.w + grow, Math.min(minW, maxW), maxW);
    const h = w / bannerRatio;
    onChange({
      size: clamp(Math.round((w / frame.w) * 100), MIN_SIZE, MAX_SIZE),
      bannerX: round1(((d.left + w / 2) / frame.w) * 100),
      bannerY: round1(((d.top + h / 2) / frame.h) * 100),
    });
  };

  const end = () => {
    drag.current = null;
  };

  const g = geometry();
  const bannerStyle = {
    width: g.w,
    height: g.h,
    left: g.left,
    top: g.top,
    opacity: (settings.opacity ?? 100) / 100,
    visibility: bannerRatio && frame.w ? 'visible' : 'hidden',
  };

  return (
    <div className={styles.wrap}>
      <div ref={stageRef} className={styles.stage} style={{ aspectRatio: String(ratio), '--ratio': ratio }}>
        {videoUrl && (
          <video
            className={styles.video}
            src={videoUrl}
            muted
            autoPlay
            loop
            playsInline
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) setVideoRatio(v.videoWidth / v.videoHeight);
            }}
          />
        )}
        {settings.overlayDim > 0 && <div className={styles.dim} style={{ opacity: settings.overlayDim / 100 }} />}
        <div
          className={styles.banner}
          style={bannerStyle}
          onPointerDown={start('move')}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        >
          {bannerIsVideo ? (
            <video
              src={bannerUrl}
              muted
              autoPlay
              loop
              playsInline
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) setBannerRatio(v.videoWidth / v.videoHeight);
              }}
            />
          ) : (
            <img
              src={bannerUrl}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const i = e.currentTarget;
                if (i.naturalWidth && i.naturalHeight) setBannerRatio(i.naturalWidth / i.naturalHeight);
              }}
            />
          )}
          <span
            className={styles.handle}
            onPointerDown={start('resize')}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            aria-label="Изменить размер"
          />
        </div>
      </div>
      <p className={styles.hint}>
        Перетащите баннер в нужное место, тяните за угол — меняется размер, пропорции сохраняются.
        {placed && ` Ширина ${Math.round(size)}%.`}
      </p>
    </div>
  );
};

export default BannerStage;
