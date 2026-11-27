/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface StudioSettings {
  mode?: string;
  place?: string;
  align?: string;
  /** @format double */
  bannerX?: number;
  /** @format double */
  bannerY?: number;
  /** @format double */
  start?: number;
  /** @format double */
  duration?: number;
  /** @format double */
  size?: number;
  /** @format double */
  opacity?: number;
  /** @format double */
  overlayDim?: number;
  /** @format double */
  overlayDuck?: number;
  green?: boolean;
  bannerAudio?: boolean;
  bannerLoop?: boolean;
  stripColor?: string;
  background?: string;
  preset?: string;
  color?: string;
  shape?: string;
  /** @format double */
  scale?: number;
  splitPlace?: string;
  /** @format double */
  splitShare?: number;
  splitFit?: string;
  format?: string;
  quality?: string;
  /** @format int32 */
  sizeLimit?: number;
  exportProfile?: string;
  captionPosition?: string;
  captionScope?: string;
  captionClock?: string;
  captionStyle?: string;
  captionSize?: string;
  /** @format double */
  sourceStart?: number;
  /** @format double */
  sourceEnd?: number;
  /** @format double */
  sourceVolume?: number;
  keepSource?: boolean;
}

export interface StudioTemplateRequestDTO {
  /**
   * @minLength 0
   * @maxLength 80
   */
  name: string;
  settings: StudioSettings;
  captions?: string;
  /** @format uuid */
  bannerAssetId?: string;
  /** @format uuid */
  backgroundAssetId?: string;
}

export interface StudioTemplateDTO {
  /** @format uuid */
  id?: string;
  name?: string;
  settings?: StudioSettings;
  captions?: string;
  /** @format uuid */
  bannerAssetId?: string;
  bannerName?: string;
  /** @format uuid */
  backgroundAssetId?: string;
  backgroundName?: string;
  active?: boolean;
  favorite?: boolean;
  /** @format date-time */
  updatedAt?: string;
}

/** Сохранение профиля заказчика */
export interface CustomerProfileRequestDTO {
  /**
   * Название компании — оно видно на карточке объявления
   * @minLength 0
   * @maxLength 255
   * @example "Демо Бренд"
   */
  company?: string;
  /** О компании: чем занимаетесь, что рекламируете */
  about?: string;
  /**
   * Telegram для связи с креаторами
   * @minLength 0
   * @maxLength 255
   * @example "@demo_brand"
   */
  telegram?: string;
  /**
   * Сайт компании
   * @minLength 0
   * @maxLength 255
   * @example "https://example.ru"
   */
  website?: string;
}

/** Профиль заказчика */
export interface CustomerProfileDTO {
  /** @format uuid */
  id?: string;
  /**
   * ID пользователя-заказчика
   * @format int64
   */
  userId?: number;
  /** Имя из учётной записи */
  name?: string;
  company?: string;
  about?: string;
  telegram?: string;
  website?: string;
  /** Когда профиль правили в последний раз, ISO-8601 */
  updatedAt?: string;
}

/** Сохранение профиля креатора */
export interface CreatorProfileRequestDTO {
  /**
   * Как показывать креатора заказчику; пусто — имя из учётки
   * @minLength 0
   * @maxLength 255
   * @example "аня снимает"
   */
  displayName?: string;
  /** О себе: формат роликов, аудитория, чем берёшь */
  bio?: string;
  /**
   * Telegram для связи; null — оставить как есть
   * @minLength 0
   * @maxLength 255
   * @example "@anya"
   */
  telegram?: string;
}

/** Профиль креатора */
export interface CreatorProfileDTO {
  /** @format uuid */
  id?: string;
  /**
   * ID пользователя-креатора
   * @format int64
   */
  userId?: number;
  /** Имя из учётной записи */
  name?: string;
  /** Отображаемое имя; может быть null */
  displayName?: string;
  bio?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  youtubeShorts?: string;
  /** Когда профиль правили в последний раз, ISO-8601 */
  updatedAt?: string;
}

/** Сохранение аватарки */
export interface AvatarRequestDTO {
  /**
   * key из ответа POST /api/profile/avatar/presign
   * @minLength 0
   * @maxLength 255
   */
  key: string;
}

/** Аватарка текущего пользователя */
export interface AvatarDTO {
  /** Временная ссылка на картинку; null — аватарки нет */
  avatarUrl?: string;
}

/** Создание/обновление объявления. Черновик можно сохранять частично: пустые поля остаются незаполненными. Запустить объявление можно, только когда заполнены заголовок, описание, фотография, тематика, площадки, ставка, бюджет и порог вывода */
export interface CampaignCreateUpdateRequestDTO {
  /**
   * Заголовок объявления; обязателен для запуска
   * @minLength 0
   * @maxLength 255
   * @example "Обзор приложения для доставки еды"
   */
  title?: string;
  /** Что нужно снять: формат, хронометраж, требования; обязательно для запуска */
  description?: string;
  /**
   * Ключ загруженной фотографии из /api/files/campaign-photo/presign; обязателен для запуска
   * @minLength 0
   * @maxLength 512
   */
  photoKey?: string;
  /**
   * Код тематики из /api/campaigns/topics; обязательна для запуска
   * @example "TECH"
   */
  topic?: string;
  /**
   * Ставка за 1000 просмотров, в копейках; обязательна для запуска
   * @format int64
   * @example 35000
   */
  ratePerThousandKopecks?: number;
  /**
   * Выделенный бюджет, в копейках; обязателен для запуска
   * @format int64
   * @example 5000000
   */
  budgetKopecks?: number;
  /**
   * С какой накопленной по объявлению суммы креатор может выводить заработанное, в копейках; обязателен для запуска
   * @format int64
   * @example 300000
   */
  minPayoutKopecks?: number;
  /**
   * Площадки, с которых заказчик принимает ролики: INSTAGRAM, TIKTOK, YOUTUBE_SHORTS; для запуска нужна хотя бы одна
   * @uniqueItems true
   * @example ["TIKTOK","YOUTUBE_SHORTS"]
   */
  platforms?: ("TELEGRAM" | "INSTAGRAM" | "TIKTOK" | "YOUTUBE_SHORTS")[];
  /**
   * Регион, просмотры из которого оплачиваются: CIS (СНГ), WORLD (весь мир); null — весь мир
   * @example "CIS"
   */
  viewRegion?: "CIS" | "WORLD";
  /**
   * Минимальная длина ролика в секундах; null — без ограничения
   * @format int32
   * @example 30
   */
  minVideoSeconds?: number;
  /**
   * Сколько просмотров должен набрать ролик, чтобы его оплатили; ниже порога начислений нет, null — оплачиваются все просмотры
   * @format int64
   * @example 1000
   */
  minPaidViews?: number;
  /**
   * Сколько роликов может подать один креатор; null — без ограничения
   * @format int32
   * @example 3
   */
  maxVideosPerCreator?: number;
  /**
   * С какого момента объявление принимает отклики, ISO-8601; null — сразу
   * @format date-time
   * @example "2026-09-20T00:00:00Z"
   */
  startsAt?: string;
  /**
   * До какого момента объявление принимает отклики, ISO-8601; null — бессрочно
   * @format date-time
   * @example "2026-10-20T20:59:59.999Z"
   */
  endsAt?: string;
  /**
   * Как платить за просмотры: CONTINUOUS — по мере роста (по умолчанию), SNAPSHOT — «ссылка и промокод»: по снимку при подаче, база ставки плюс надбавки
   * @example "SNAPSHOT"
   */
  paymentModel?: "CONTINUOUS" | "SNAPSHOT";
  /**
   * SNAPSHOT: общая рекламная HTTPS-ссылка, которую креаторы ставят в ссылки профиля; обязательна, если есть надбавка за ссылку
   * @minLength 0
   * @maxLength 1024
   * @example "https://example.com/app?utm_source=offer"
   */
  promoUrl?: string;
  /**
   * SNAPSHOT: общий многоразовый промокод для закреплённого комментария; обязателен, если есть надбавка за промокод
   * @minLength 0
   * @maxLength 64
   * @example "OFFER20"
   */
  promoCode?: string;
  /**
   * SNAPSHOT: что даёт промокод и на каких условиях — попадёт в шаблон комментария
   * @minLength 0
   * @maxLength 2000
   * @example "−20% на первый месяц, до 31 декабря"
   */
  promoBenefit?: string;
  /**
   * SNAPSHOT: надбавка к базовой ставке за ссылку в профиле, в копейках за 1000 просмотров; 0 или null — не предлагается
   * @format int64
   * @example 30000
   */
  linkBonusPerThousandKopecks?: number;
  /**
   * SNAPSHOT: надбавка к базовой ставке за промокод в закрепе, в копейках за 1000 просмотров; 0 или null — не предлагается
   * @format int64
   * @example 20000
   */
  promoBonusPerThousandKopecks?: number;
  /**
   * SNAPSHOT: сколько дней после подачи держать ссылку и закреп; null — 7
   * @format int32
   * @min 1
   * @max 90
   * @example 7
   */
  placementRetentionDays?: number;
  /**
   * SNAPSHOT: потолок вознаграждения за один ролик, в копейках; null — без потолка
   * @format int64
   * @example 1000000
   */
  maxRewardPerVideoKopecks?: number;
  /**
   * Материалы для креатора: файлы и ссылки, в порядке показа; null — без материалов
   * @maxItems 10
   * @minItems 0
   */
  materials?: CampaignMaterialRequestDTO[];
  /**
   * Статус; null — не менять (при создании DRAFT)
   * @example "ACTIVE"
   */
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
}

/** Материал для креатора: загруженный файл или ссылка */
export interface CampaignMaterialRequestDTO {
  /**
   * FILE — файл из /api/files/campaign-material/presign, LINK — внешняя ссылка
   * @example "LINK"
   */
  kind: "FILE" | "LINK";
  /**
   * Подпись; для файла по умолчанию — имя файла, для ссылки — сама ссылка
   * @minLength 0
   * @maxLength 255
   * @example "Референсы"
   */
  title?: string;
  /**
   * Адрес (только для LINK)
   * @minLength 0
   * @maxLength 2048
   * @example "https://disk.yandex.ru/d/abc"
   */
  url?: string;
  /**
   * Ключ загруженного файла (только для FILE)
   * @minLength 0
   * @maxLength 512
   */
  fileKey?: string;
  /**
   * MIME-тип файла (только для FILE)
   * @minLength 0
   * @maxLength 255
   * @example "application/pdf"
   */
  contentType?: string;
  /**
   * Размер файла в байтах (только для FILE)
   * @format int64
   * @example 1048576
   */
  sizeBytes?: number;
}

/** Объявление целиком: карточка заказчика и публичная страница */
export interface CampaignDTO {
  /** @format uuid */
  id?: string;
  /** Короткий номер для публичных ссылок */
  publicId?: string;
  title?: string;
  description?: string;
  /** Временная ссылка на фотографию; null — фото не загружено */
  photoUrl?: string;
  /** Ключ фотографии в хранилище; отправляется обратно при обновлении */
  photoKey?: string;
  /** Тематика; null — не выбрана */
  topic?: string;
  /**
   * Человекочитаемая тематика
   * @example "Технологии и гаджеты"
   */
  topicDescription?: string;
  /**
   * Средняя ставка за 1000 просмотров по тематике, в копейках; null — неизвестна
   * @format int64
   */
  topicAverageRatePerThousandKopecks?: number;
  /**
   * Ставка за 1000 просмотров, в копейках
   * @format int64
   */
  ratePerThousandKopecks?: number;
  /**
   * Выделенный бюджет, в копейках
   * @format int64
   */
  budgetKopecks?: number;
  /**
   * Уже начислено креаторам, в копейках
   * @format int64
   */
  spentKopecks?: number;
  /**
   * Остаток бюджета, в копейках
   * @format int64
   */
  remainingKopecks?: number;
  /**
   * С какой накопленной по объявлению суммы креатор может выводить заработанное, в копейках
   * @format int64
   */
  minPayoutKopecks?: number;
  /** Статус: DRAFT, ACTIVE, PAUSED, COMPLETED */
  status?: string;
  /**
   * Человекочитаемый статус
   * @example "Активно"
   */
  statusDescription?: string;
  /** Площадки, с которых принимаются ролики: INSTAGRAM, TIKTOK, YOUTUBE_SHORTS */
  platforms?: string[];
  /** Регион, просмотры из которого оплачиваются: CIS, WORLD */
  viewRegion?: string;
  /**
   * Человекочитаемый регион просмотров
   * @example "СНГ"
   */
  viewRegionDescription?: string;
  /**
   * Минимальная длина ролика в секундах; null — без ограничения
   * @format int32
   */
  minVideoSeconds?: number;
  /**
   * Сколько просмотров должен набрать ролик, чтобы его оплатили; null — оплачиваются все
   * @format int64
   */
  minPaidViews?: number;
  /**
   * Сколько роликов может подать один креатор; null — без ограничения
   * @format int32
   */
  maxVideosPerCreator?: number;
  /** С какого момента принимаются отклики, ISO-8601; null — сразу */
  startsAt?: string;
  /** До какого момента принимаются отклики, ISO-8601; null — бессрочно */
  endsAt?: string;
  /** Принимает ли объявление отклики прямо сейчас: статус ACTIVE и период действия не истёк */
  acceptingApplications?: boolean;
  /** Материалы для креатора в порядке показа */
  materials?: CampaignMaterialDTO[];
  /** Как платит объявление: CONTINUOUS — по мере роста просмотров, SNAPSHOT — «ссылка и промокод» */
  paymentModel?: string;
  /** Человекочитаемый способ оплаты */
  paymentModelDescription?: string;
  /** Общая рекламная ссылка; на публичной странице скрыта до взятия оффера */
  promoUrl?: string;
  /** Общий промокод; на публичной странице скрыт до взятия оффера */
  promoCode?: string;
  /** Что даёт промокод зрителю */
  promoBenefit?: string;
  /**
   * Надбавка за ссылку в профиле, в копейках за 1000 просмотров
   * @format int64
   */
  linkBonusPerThousandKopecks?: number;
  /**
   * Надбавка за промокод в закрепе, в копейках за 1000 просмотров
   * @format int64
   */
  promoBonusPerThousandKopecks?: number;
  /** Предлагает ли объявление надбавку за ссылку */
  offersLink?: boolean;
  /** Предлагает ли объявление надбавку за промокод */
  offersPromo?: boolean;
  /**
   * Сколько дней после подачи держать ссылку и закреп
   * @format int32
   */
  placementRetentionDays?: number;
  /**
   * Потолок вознаграждения за ролик, в копейках; null — без потолка
   * @format int64
   */
  maxRewardPerVideoKopecks?: number;
  /** @format int64 */
  customerId?: number;
  customerName?: string;
  /** Компания заказчика; null — профиль не заполнен */
  customerCompany?: string;
  /**
   * Всего откликов по объявлению
   * @format int32
   */
  applicationsCount?: number;
  /**
   * Сумма просмотров по одобренным откликам
   * @format int64
   */
  totalViews?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Материал для креатора: файл со временной ссылкой на скачивание или внешняя ссылка */
export interface CampaignMaterialDTO {
  /** FILE или LINK */
  kind?: string;
  /** Подпись: имя файла или название ссылки */
  title?: string;
  /** Куда вести: для файла — временная ссылка на хранилище, для ссылки — сам адрес */
  url?: string;
  /** Ключ файла в хранилище; отправляется обратно при обновлении объявления */
  fileKey?: string;
  /** MIME-тип файла; null у ссылки */
  contentType?: string;
  /**
   * Размер файла в байтах; null у ссылки
   * @format int64
   */
  sizeBytes?: number;
  /** Файл откроется во вкладке браузера (картинка, PDF, видео), а не скачается */
  opensInBrowser?: boolean;
}

/** Ролик к взятому в работу офферу */
export interface ApplicationVideoRequestDTO {
  /**
   * Ссылка на выложенный ролик; площадка определяется по ней: YouTube, TikTok или Instagram
   * @minLength 0
   * @maxLength 1024
   * @example "https://www.tiktok.com/@demo/video/123"
   */
  videoUrl: string;
  /** Комментарий заказчику: что сняли и почему так */
  comment?: string;
}

/** Отклик креатора: и в списке заказчика, и в списке креатора */
export interface ApplicationDTO {
  /** @format uuid */
  id?: string;
  /** Короткий номер отклика */
  publicId?: string;
  /** @format uuid */
  campaignId?: string;
  /** Короткий номер объявления для ссылки на него */
  campaignPublicId?: string;
  campaignTitle?: string;
  /** Когда объявление перестаёт принимать отклики и ролики, ISO-8601; null — бессрочно */
  campaignEndsAt?: string;
  /**
   * Ставка объявления за 1000 просмотров, в копейках
   * @format int64
   */
  ratePerThousandKopecks?: number;
  /**
   * Порог вывода объявления: с какой накопленной по нему суммы креатор может выводить, в копейках
   * @format int64
   */
  minPayoutKopecks?: number;
  /** Регион просмотров объявления: CIS, WORLD */
  campaignViewRegion?: string;
  /**
   * Человекочитаемый регион
   * @example "СНГ"
   */
  campaignViewRegionDescription?: string;
  /** @format int64 */
  creatorId?: number;
  creatorName?: string;
  /** Telegram креатора из профиля; null — не заполнен */
  creatorTelegram?: string;
  /** Площадка: TELEGRAM, INSTAGRAM, TIKTOK, YOUTUBE_SHORTS */
  platform?: string;
  /**
   * Человекочитаемая площадка
   * @example "TikTok"
   */
  platformDescription?: string;
  videoUrl?: string;
  comment?: string;
  /** Статус: IN_PROGRESS (взят в работу, ролика ещё нет), PENDING, APPROVED, REJECTED, COMPLETED */
  status?: string;
  /**
   * Человекочитаемый статус
   * @example "Одобрен"
   */
  statusDescription?: string;
  /**
   * Набранные просмотры
   * @format int64
   */
  views?: number;
  /**
   * Просмотры, которые идут в расчёт выплаты: для «весь мир» — все, иначе только из региона; 0, если география неизвестна
   * @format int64
   */
  payableViews?: number;
  /** Известна ли география просмотров (для «весь мир» всегда true) */
  viewsGeographyKnown?: boolean;
  /**
   * Начислено креатору, в копейках
   * @format int64
   */
  accruedKopecks?: number;
  /** Когда просмотры обновлялись в последний раз, ISO-8601 */
  viewsSyncedAt?: string;
  /**
   * Уже зачислено в кошелёк креатора, в копейках
   * @format int64
   */
  creditedKopecks?: number;
  /** Когда ролик опубликован на площадке, ISO-8601; null — неизвестно */
  videoPublishedAt?: string;
  /** Вердикт антифрода: CLEAN, SUSPICIOUS, FRAUD, VERIFIED */
  fraudStatus?: string;
  /**
   * Человекочитаемый вердикт
   * @example "Чисто"
   */
  fraudStatusDescription?: string;
  /**
   * Баллы скоринга 0–100; креатору не показываются
   * @format int32
   */
  fraudScore?: number;
  /** Сработавшие правила; креатору не показываются */
  fraudFlags?: FraudFlagDTO[];
  /** Репутация креатора: NEW, TRUSTED, RESTRICTED, BLOCKED */
  creatorTrustLevel?: string;
  /**
   * Человекочитаемая репутация
   * @example "Новичок"
   */
  creatorTrustLevelDescription?: string;
  /** Когда отклик прошёл модерацию, ISO-8601; null — ещё не проверен */
  moderatedAt?: string;
  /** Причина отказа; есть только у REJECTED */
  rejectionReason?: string;
  /** Как платит объявление: CONTINUOUS или SNAPSHOT («ссылка и промокод») */
  paymentModel?: string;
  /** Условия и состояние работы «ссылка и промокод»: ставки, снимок при подаче, материалы, надбавки */
  placement?: ApplicationPlacementDTO;
  createdAt?: string;
  updatedAt?: string;
}

/** Условия и состояние работы «ссылка и промокод»: ставки, снимок при подаче, материалы, надбавки */
export interface ApplicationPlacementDTO {
  /**
   * Базовая ставка за 1000 просмотров на момент взятия оффера, в копейках
   * @format int64
   */
  baseRatePerThousandKopecks?: number;
  /**
   * Надбавка за ссылку в профиле, в копейках за 1000 просмотров; 0 — не предлагается
   * @format int64
   */
  linkBonusPerThousandKopecks?: number;
  /**
   * Надбавка за промокод в закрепе, в копейках за 1000 просмотров; 0 — не предлагается
   * @format int64
   */
  promoBonusPerThousandKopecks?: number;
  /**
   * Ставка выбранного варианта: база и выбранные надбавки
   * @format int64
   */
  selectedRatePerThousandKopecks?: number;
  /**
   * Ставка, под которую занят бюджет: база и надбавки без отказа
   * @format int64
   */
  reservedRatePerThousandKopecks?: number;
  /**
   * Ставка, которая уже уходит в кошелёк: база и засчитанные надбавки
   * @format int64
   */
  creditableRatePerThousandKopecks?: number;
  /**
   * Оплачиваемые просмотры из снимка при подаче; null — работа ещё не подана
   * @format int64
   */
  billingViews?: number;
  /** Когда снят снимок при подаче, ISO-8601 */
  billingCapturedAt?: string;
  /**
   * Откуда снимок
   * @example "ScrapeCreators"
   */
  billingSource?: string;
  /** Когда работа подана, ISO-8601; null — ещё не подана */
  submittedAt?: string;
  /** До какого момента держать ссылку и закреп, ISO-8601; null — работа ещё не подана */
  retainUntil?: string;
  /**
   * Сколько дней после подачи держать ссылку и закреп
   * @format int32
   */
  retentionDays?: number;
  /**
   * Потолок вознаграждения за ролик, в копейках; null — без потолка
   * @format int64
   */
  maxRewardPerVideoKopecks?: number;
  /** Общая рекламная ссылка кампании */
  promoUrl?: string;
  /** Общий промокод кампании */
  promoCode?: string;
  /** Что даёт промокод зрителю */
  promoBenefit?: string;
  /** Одна надбавка работы «ссылка и промокод»: состояние, доказательство, автопроверка, решение */
  link?: PlacementDTO;
  /** Одна надбавка работы «ссылка и промокод»: состояние, доказательство, автопроверка, решение */
  promo?: PlacementDTO;
}

/** Сработавшее правило антифрода */
export interface FraudFlagDTO {
  /**
   * Код правила
   * @example "LOW_ENGAGEMENT"
   */
  code?: string;
  /**
   * Название правила
   * @example "Слишком мало лайков"
   */
  title?: string;
  /**
   * Сколько баллов добавило
   * @format int32
   */
  points?: number;
  /** Пояснение с цифрами */
  detail?: string;
}

/** Одна надбавка работы «ссылка и промокод»: состояние, доказательство, автопроверка, решение */
export interface PlacementDTO {
  /** LINK — ссылка в профиле, PROMO — промокод в закрепе */
  kind?: string;
  /**
   * Человекочитаемая надбавка
   * @example "Ссылка в профиле"
   */
  kindDescription?: string;
  /** Предлагает ли объявление эту надбавку */
  offered?: boolean;
  /** NOT_SELECTED, PENDING, VERIFIED, EARNED, REJECTED */
  state?: string;
  /**
   * Человекочитаемое состояние
   * @example "Ждёт проверки"
   */
  stateDescription?: string;
  /** Временная ссылка на скриншот или запись экрана; null — не приложено */
  proofFileUrl?: string;
  /** Ключ доказательства в хранилище */
  proofKey?: string;
  /** Ссылка от креатора: на закреплённый комментарий или профиль */
  proofUrl?: string;
  /** Автопроверка: FOUND, MISSING, UNKNOWN; null — не проводилась */
  checkState?: string;
  /** Человекочитаемый итог автопроверки */
  checkStateDescription?: string;
  /** Что увидела автопроверка */
  checkDetail?: string;
  /** Когда прошла автопроверка, ISO-8601 */
  checkedAt?: string;
  /** Причина отказа или пометка системы */
  note?: string;
  /** Когда принято решение, ISO-8601 */
  decidedAt?: string;
}

/** Вариант участия «ссылка и промокод»: какие надбавки креатор берёт на себя */
export interface PlacementChoiceRequestDTO {
  /** Поставлю рекламную ссылку в профиль */
  withLink?: boolean;
  /** Закреплю комментарий с промокодом под роликом */
  withPromo?: boolean;
}

/** Исправление надбавки: новое доказательство после отказа или вместо старого */
export interface PlacementProofRequestDTO {
  /**
   * Ключ скриншота или записи экрана из /api/files/placement-proof/presign
   * @minLength 0
   * @maxLength 512
   */
  proofKey?: string;
  /**
   * Ссылка на закреплённый комментарий или профиль
   * @minLength 0
   * @maxLength 1024
   */
  proofUrl?: string;
}

/** Заявка заказчика на пополнение: сколько он собирается перевести */
export interface TopUpCreateRequestDTO {
  /**
   * Сумма в копейках
   * @format int64
   * @example 5000000
   */
  amountKopecks: number;
}

/** Одна сторона движения денег: откуда они ушли или куда пришли */
export interface FlowPointDTO {
  /** EXTERNAL, CUSTOMER_WALLET, CAMPAIGN, CREATOR_WALLET, TRON или PARTNER_PROGRAM */
  kind?: string;
  /**
   * Подпись для человека
   * @example "Кошелёк заказчика · Иван"
   */
  label?: string;
  /**
   * Владелец кошелька, если сторона — кошелёк
   * @format int64
   */
  userId?: number;
  /**
   * Объявление, если сторона — бюджет объявления
   * @format uuid
   */
  campaignId?: string;
  campaignPublicId?: string;
}

/** Операция целиком: сама проводка и, если деньги ходили вне платформы, перевод со скриншотами и подтверждениями */
export interface OperationDetailDTO {
  /** Операция по кошельку; сумма со знаком относительно свободных средств */
  transaction?: WalletTransactionDTO;
  /** Перевод вне платформы по операции: адрес TRON, номер транзакции, скриншоты, кто и когда */
  transfer?: TransferDTO;
}

/** Скриншоты перевода: ключ и временная ссылка */
export interface ProofDTO {
  key?: string;
  url?: string;
}

/** Перевод вне платформы по операции: адрес TRON, номер транзакции, скриншоты, кто и когда */
export interface TransferDTO {
  /** Адрес кошелька TRON, куда ушли USDT; null для пополнения */
  tronAddress?: string;
  /** Курс USDT/RUB, зафиксированный при создании заявки; null у заявок, созданных до фиксации курса */
  usdtRate?: number;
  /**
   * Комиссия платформы, в копейках: у пополнения платится сверху, у выводов удерживается из суммы
   * @format int64
   */
  commissionKopecks?: number;
  /**
   * Сколько в рублях уходит переводом USDT: у пополнения сумма с комиссией, у выводов — за вычетом комиссии
   * @format int64
   */
  transferKopecks?: number;
  /** Номер (хеш) транзакции в сети TRON */
  txId?: string;
  /** Комментарий финансиста */
  financeComment?: string;
  /** Почему операция отклонена; null — не отклонена */
  rejectReason?: string;
  /** Скриншоты перевода: ключ и временная ссылка */
  proofs?: ProofDTO[];
  /** Финансист, который провёл или отклонил */
  processedByName?: string;
  /**
   * Владелец кошелька: креатор для выплаты, заказчик для пополнения и вывода
   * @format int64
   */
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  sentAt?: string;
  confirmedAt?: string;
  closedAt?: string;
  /** До какого момента заявку на пополнение нужно оплатить, ISO-8601; null — срока нет */
  expiresAt?: string;
}

/** Операция по кошельку; сумма со знаком относительно свободных средств */
export interface WalletTransactionDTO {
  /**
   * Публичный номер операции для ссылок
   * @example "K7Q2M9XA"
   */
  publicId?: string;
  /** Тип: TOP_UP, WITHDRAWAL, ALLOCATION, RELEASE, EARNING, PAYOUT, REFERRAL_REWARD */
  type?: string;
  /**
   * Человекочитаемый тип
   * @example "Пополнение"
   */
  typeDescription?: string;
  /**
   * Сумма в копейках: плюс — деньги пришли в кошелёк, минус — ушли
   * @format int64
   */
  amountKopecks?: number;
  /**
   * Свободный остаток после операции, в копейках
   * @format int64
   */
  balanceAfterKopecks?: number;
  /** Статус: DONE, PENDING, SENT, CONFIRMED, REJECTED, CANCELLED */
  status?: string;
  /**
   * Человекочитаемый статус
   * @example "Проведена"
   */
  statusDescription?: string;
  /** Чей кошелёк */
  ownerName?: string;
  /** @format int64 */
  ownerId?: number;
  /** Одна сторона движения денег: откуда они ушли или куда пришли */
  source?: FlowPointDTO;
  /** Одна сторона движения денег: откуда они ушли или куда пришли */
  destination?: FlowPointDTO;
  /**
   * Объявление, если операция про него; null — объявление удалено или операция общая
   * @format uuid
   */
  campaignId?: string;
  campaignTitle?: string;
  campaignPublicId?: string;
  /** Кто провёл операцию; null — учётка удалена или операция автоматическая */
  actorName?: string;
  comment?: string;
  createdAt?: string;
}

/** Заказчик перевёл USDT по заявке: скриншоты или файлы перевода и, если есть, номер транзакции */
export interface TopUpPaidRequestDTO {
  /**
   * Номер (хеш) транзакции в сети TRON; необязателен, но ускоряет проверку
   * @minLength 0
   * @maxLength 255
   * @example "7c1e0f…9a2b"
   */
  txId?: string;
  /**
   * Ключи файлов из /api/files/transfer-proof/presign
   * @maxItems 10
   * @minItems 0
   */
  proofKeys: string[];
}

export interface StudioPresignRequestDTO {
  /**
   * @minLength 0
   * @maxLength 160
   */
  filename: string;
  /**
   * @minLength 0
   * @maxLength 128
   */
  contentType: string;
  purpose: string;
  /** @format int64 */
  size: number;
}

export interface StudioPresignResponseDTO {
  uploadUrl?: string;
  key?: string;
}

export interface StudioActiveTemplateRequestDTO {
  /** @format uuid */
  templateId?: string;
  favorite?: boolean;
}

export interface StudioTelegramLinkDTO {
  url?: string;
  /** @format date-time */
  expiresAt?: string;
}

export interface StudioJobRequestDTO {
  sourceKey: string;
  /**
   * @minLength 0
   * @maxLength 160
   */
  filename: string;
  settings: StudioSettings;
  captions?: string;
  bannerKey?: string;
  /** @format uuid */
  bannerAssetId?: string;
  backgroundKey?: string;
  /** @format uuid */
  backgroundAssetId?: string;
}

export interface StudioJobDTO {
  /** @format uuid */
  id?: string;
  status?: string;
  origin?: string;
  filename?: string;
  /** @format int32 */
  progress?: number;
  /** @format int64 */
  queuePosition?: number;
  error?: string;
  settings?: StudioSettings;
  preset?: string;
  presetName?: string;
  /** @format uuid */
  batchId?: string;
  /** @format int64 */
  resultSize?: number;
  downloadUrl?: string;
  previewUrl?: string;
  /** @format date-time */
  retryUntil?: string;
  /** @format date-time */
  availableUntil?: string;
  canSendToTelegram?: boolean;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  startedAt?: string;
  /** @format date-time */
  finishedAt?: string;
}

export interface StudioRetryRequestDTO {
  quality?: string;
}

export interface StudioAssetRequestDTO {
  key: string;
  kind: string;
  /**
   * @minLength 0
   * @maxLength 120
   */
  name: string;
  shared?: boolean;
}

export interface StudioAssetDTO {
  /** @format uuid */
  id?: string;
  kind?: string;
  name?: string;
  shared?: boolean;
  own?: boolean;
  video?: boolean;
  /** @format int64 */
  sizeBytes?: number;
  url?: string;
  /** @format date-time */
  createdAt?: string;
}

/** Аккаунт, который креатор хочет привязать по проверочному коду */
export interface SocialVerificationRequestDTO {
  /**
   * Ник (с @ или без) или ссылка на профиль; для YouTube ещё id канала UC…
   * @minLength 0
   * @maxLength 300
   * @example "@my_channel"
   */
  account: string;
}

/** Найденный профиль и код, который креатор добавляет в его описание */
export interface SocialVerificationDTO {
  /**
   * Площадка
   * @example "TIKTOK"
   */
  platform?: string;
  /**
   * Название площадки для интерфейса
   * @example "TikTok"
   */
  platformLabel?: string;
  /** Идентификатор аккаунта на стороне площадки */
  externalId?: string;
  /** Ник; у YouTube может быть null */
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  /** @format int64 */
  followers?: number;
  /**
   * Код для описания профиля
   * @example "OFFER-7KQ2PX"
   */
  code?: string;
  /** Куда вставить код, для подсказки в интерфейсе */
  codePlacement?: string;
  /** Код уже стоит в описании — можно сразу подтверждать */
  codeFound?: boolean;
  /** Аккаунт уже привязан к этому креатору */
  alreadyConnected?: boolean;
}

/** Привязанный аккаунт соцсети */
export interface SocialAccountDTO {
  /** @format uuid */
  id?: string;
  /**
   * Площадка
   * @example "TIKTOK"
   */
  platform?: string;
  /**
   * Название площадки для интерфейса
   * @example "TikTok"
   */
  platformLabel?: string;
  /** Идентификатор аккаунта на стороне площадки */
  externalId?: string;
  /** Ник аккаунта; может быть null */
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  /** @format int64 */
  followers?: number;
  /** ACTIVE — аккаунт в работе, EXPIRED — нужна повторная привязка */
  status?: string;
  /** Когда аккаунт привязали, ISO-8601 */
  connectedAt?: string;
  /** До какого момента живёт токен, ISO-8601 */
  tokenExpiresAt?: string;
  /** Отдаёт ли привязанный аккаунт географию просмотров (YouTube с доступом к аналитике); для других площадок false */
  reportsViewGeography?: boolean;
  /**
   * Как привязан: OAUTH — вход на площадке, SCRAPE — код в описании профиля
   * @example "SCRAPE"
   */
  linkMethod?: string;
}

/** Ссылка, по которой креатора отправляют на страницу согласия площадки */
export interface SocialAuthorizeResponseDTO {
  /**
   * Площадка
   * @example "TIKTOK"
   */
  platform?: string;
  /** Адрес страницы согласия */
  authorizationUrl?: string;
}

/** Запрос ссылки на прямую загрузку файла в хранилище */
export interface PresignUploadRequestDTO {
  /**
   * Имя файла — из него берётся только расширение
   * @minLength 0
   * @maxLength 255
   * @example "photo.jpg"
   */
  filename: string;
  /**
   * MIME-тип файла, допускаются только изображения
   * @example "image/jpeg"
   */
  contentType: string;
}

/** Ссылка на прямую загрузку файла в хранилище */
export interface PresignUploadResponseDTO {
  /** Куда отправить PUT с телом файла и тем же Content-Type */
  uploadUrl?: string;
  /** Ключ файла — его передают при сохранении объявления */
  key?: string;
}

/** Партнёрская программа рекламодателя: условия, код приглашения и что принесли приглашённые */
export interface PartnerDTO {
  /** Подключена ли программа */
  active?: boolean;
  /**
   * Код приглашения для ссылки на лендинг; null — программа не подключена
   * @example "K7Q2M9XA"
   */
  code?: string;
  /** Когда подключена, ISO-8601; null — не подключена */
  joinedAt?: string;
  /**
   * Комиссия платформы с пополнений и выводов, %
   * @example 10
   */
  commissionPercent?: number;
  /**
   * Доля партнёра от комиссии платформы с приглашённых, %
   * @example 10
   */
  partnerSharePercent?: number;
  /**
   * Сколько рекламодателей зарегистрировалось по приглашению
   * @format int32
   */
  invitedCount?: number;
  /**
   * Сколько из них уже принесли вознаграждение
   * @format int32
   */
  activeCount?: number;
  /**
   * Заработано за всё время, в копейках
   * @format int64
   */
  earnedKopecks?: number;
  /** Приглашённые рекламодатели, новые сверху */
  referrals?: PartnerReferralDTO[];
  /** Последние начисления, новые сверху */
  rewards?: PartnerRewardDTO[];
}

/** Рекламодатель, зарегистрированный по приглашению партнёра */
export interface PartnerReferralDTO {
  /** Имя рекламодателя */
  name?: string;
  /** Когда зарегистрировался, ISO-8601 */
  joinedAt?: string;
  /**
   * Сколько партнёр заработал на нём, в копейках
   * @format int64
   */
  earnedKopecks?: number;
  /**
   * Сколько начислений он принёс
   * @format int32
   */
  rewardsCount?: number;
}

/** Начисление партнёру с комиссии платформы по операции приглашённого */
export interface PartnerRewardDTO {
  /**
   * Публичный номер начисления в кошельке партнёра
   * @example "K7Q2M9XA"
   */
  publicId?: string;
  /** Кто из приглашённых принёс начисление */
  referralName?: string;
  /** Операция приглашённого: TOP_UP или WITHDRAWAL */
  sourceType?: string;
  /**
   * Человекочитаемая операция
   * @example "Пополнение"
   */
  sourceTypeDescription?: string;
  /**
   * Комиссия платформы с операции, в копейках
   * @format int64
   */
  commissionKopecks?: number;
  /**
   * Доля партнёра, в копейках
   * @format int64
   */
  rewardKopecks?: number;
  createdAt?: string;
}

/** Финансист отметил, что USDT отправлены: номер транзакции и скриншоты */
export interface TransferSentRequestDTO {
  /**
   * Номер (хеш) транзакции в сети TRON
   * @minLength 0
   * @maxLength 255
   * @example "7c1e0f…9a2b"
   */
  txId: string;
  /**
   * Ключи скриншотов из /api/files/transfer-proof/presign
   * @maxItems 10
   * @minItems 0
   */
  proofKeys: string[];
  /**
   * Ссылка на транзакцию в обозревателе, пояснение
   * @minLength 0
   * @maxLength 2000
   * @example "https://tronscan.org/#/transaction/…"
   */
  comment?: string;
}

/** Отклонение операции: деньги возвращаются туда, откуда ушли */
export interface TransferRejectRequestDTO {
  /**
   * Причина, которую увидит владелец кошелька
   * @minLength 0
   * @maxLength 1000
   * @example "Адрес не похож на TRC-20, уточните кошелёк"
   */
  reason: string;
}

/** Вывод из кошелька заказчика: USDT уже отправлены, финансист прикладывает документы */
export interface WalletOperationRequestDTO {
  /**
   * Сумма в копейках
   * @format int64
   * @example 5000000
   */
  amountKopecks: number;
  /**
   * Номер (хеш) транзакции в сети TRON
   * @minLength 0
   * @maxLength 255
   * @example "7c1e0f…9a2b"
   */
  txId: string;
  /**
   * Ключи скриншотов из /api/files/transfer-proof/presign
   * @maxItems 10
   * @minItems 0
   */
  proofKeys: string[];
  /**
   * Адрес TRON заказчика, куда ушли USDT
   * @minLength 0
   * @maxLength 64
   * @example "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
   */
  tronAddress?: string;
  /**
   * Основание: номер счёта, договор, пояснение
   * @minLength 0
   * @maxLength 500
   * @example "Счёт №14 от 01.09"
   */
  comment?: string;
}

/** Заявка креатора на вывод USDT (TRC-20) */
export interface PayoutCreateRequestDTO {
  /**
   * Сколько вывести, в копейках; не больше доступного
   * @format int64
   * @example 300000
   */
  amountKopecks: number;
  /**
   * Адрес кошелька TRON (TRC-20): начинается с T, 34 символа
   * @minLength 0
   * @maxLength 64
   * @example "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
   */
  tronAddress: string;
}

/** Новая тематика, если подходящей не нашлось */
export interface CampaignTopicCreateRequestDTO {
  /**
   * Название: от 2 до 48 символов — буквы, цифры, пробелы и знаки . , - & + / ( ) « » ' "
   * @minLength 0
   * @maxLength 48
   * @example "Кулинария"
   */
  name: string;
}

/** Тематика объявления со средней ставкой по ней */
export interface CampaignTopicDTO {
  /**
   * Код тематики; его передают в topic при сохранении объявления
   * @example "TECH"
   */
  code?: string;
  /**
   * Название тематики
   * @example "Технологии и гаджеты"
   */
  description?: string;
  /**
   * Средняя ставка за 1000 просмотров по тематике, в копейках; null — неизвестна: тематику добавил заказчик
   * @format int64
   * @example 20000
   */
  averageRatePerThousandKopecks?: number;
}

/** Обмен кода из письма на JWT */
export interface VerifyCodeDTO {
  /**
   * Почта, на которую приходил код
   * @example "demo-creator@traffic.ru"
   */
  email: string;
  /**
   * Шестизначный код из письма
   * @example "123456"
   */
  code: string;
}

/** Результат входа */
export interface AuthResponseDTO {
  /** JWT для заголовка Authorization: Bearer */
  token?: string;
  /** Роль: CUSTOMER, CREATOR, FINANCE_MANAGER, ADMIN или SUPER_ADMIN */
  role?: string;
  /** Почта, она же логин */
  email?: string;
  name?: string;
}

/** Вход из мини-приложения Telegram */
export interface TelegramWebAppRequestDTO {
  /** Telegram.WebApp.initData как есть */
  initData: string;
  /**
   * Для Telegram без учётки: cr — новый креатор, cu — новый рекламодатель, have — есть учётка с почтой
   * @pattern cr|cu|have
   */
  action?: string;
  referralCode?: string;
}

/** Результат входа из мини-приложения Telegram */
export interface TelegramWebAppDTO {
  /** DONE — вход выполнен, токен в auth; NEED_ACCOUNT — Telegram ни к чему не привязан, нужно выбрать action; NEED_EMAIL — войдите по почте и передайте secret в /telegram/attach */
  status?: string;
  /** Результат входа */
  auth?: AuthResponseDTO;
  /** Имя или @ник Telegram для подсказки */
  telegram?: string;
  /** Секрет для /telegram/attach при NEED_EMAIL */
  secret?: string;
  /** start_param из ссылки t.me/бот/app?startapp=… */
  startParam?: string;
}

/** Начало входа через Telegram. Роль — только со страницы регистрации */
export interface TelegramAuthStartRequestDTO {
  /** CUSTOMER или CREATOR для новой учётки; пусто — бот спросит сам */
  role?:
    | "CUSTOMER"
    | "CREATOR"
    | "FINANCE_MANAGER"
    | "ADMIN"
    | "SUPER_ADMIN"
    | "SERVICE";
  /**
   * @minLength 0
   * @maxLength 64
   */
  referralCode?: string;
}

/** Попытка входа через Telegram: ссылка в бота и секрет, по которому браузер ждёт результат */
export interface TelegramAuthStartDTO {
  /** Ссылка t.me на бота с кодом входа */
  url?: string;
  /** Секрет попытки — хранится только в этом браузере */
  secret?: string;
  /** @format date-time */
  expiresAt?: string;
}

export interface TelegramAuthSecretDTO {
  /**
   * @minLength 0
   * @maxLength 128
   */
  secret: string;
}

/** Состояние входа через Telegram */
export interface TelegramAuthPollDTO {
  /** PENDING — ждём бота; DONE — вход выполнен, токен в auth; NEED_EMAIL — Telegram подтверждён, но учётки нет: войдите по почте, и он привяжется; CANCELLED — отменено в боте; EXPIRED — попытка устарела */
  status?: string;
  /** Результат входа */
  auth?: AuthResponseDTO;
  /** Имя или @ник Telegram для подсказки */
  telegram?: string;
}

/** Запрос кода входа на почту */
export interface RequestCodeDTO {
  /**
   * Почта, на которую придёт код
   * @example "demo-creator@traffic.ru"
   */
  email: string;
}

/** Запрос на регистрацию */
export interface RegisterRequestDTO {
  /**
   * Почта, она же логин
   * @minLength 0
   * @maxLength 255
   * @example "creator@traffic.ru"
   */
  email: string;
  /**
   * Имя (как обращаться к человеку)
   * @minLength 1
   * @maxLength 255
   * @example "Аня"
   */
  name: string;
  /**
   * Роль: CUSTOMER (заказчик) или CREATOR (креатор)
   * @example "CREATOR"
   */
  role:
    | "CUSTOMER"
    | "CREATOR"
    | "FINANCE_MANAGER"
    | "ADMIN"
    | "SUPER_ADMIN"
    | "SERVICE";
  /**
   * Код приглашения партнёра из ссылки; неизвестный код не мешает регистрации
   * @minLength 0
   * @maxLength 64
   * @example "K7Q2M9XA"
   */
  referralCode?: string;
}

export interface EmailCodeDTO {
  /**
   * @minLength 0
   * @maxLength 255
   */
  email: string;
  /**
   * @minLength 0
   * @maxLength 16
   */
  code?: string;
}

/** Отклик креатора на объявление */
export interface ApplicationCreateRequestDTO {
  /**
   * ID объявления
   * @format uuid
   */
  campaignId: string;
  /**
   * Ссылка на выложенный ролик; площадка определяется по ней: YouTube, TikTok или Instagram. Без ссылки оффер берётся в работу (IN_PROGRESS), ролик прикладывается позже
   * @minLength 0
   * @maxLength 1024
   * @example "https://www.tiktok.com/@demo/video/123"
   */
  videoUrl?: string;
  /** Комментарий заказчику: что сняли и почему так */
  comment?: string;
  /** Объявление «ссылка и промокод»: беру надбавку за рекламную ссылку в профиле */
  withLink?: boolean;
  /** Объявление «ссылка и промокод»: беру надбавку за промокод в закреплённом комментарии */
  withPromo?: boolean;
}

/** Подтверждение расчёта и подача работы «ссылка и промокод» */
export interface SnapshotSubmitRequestDTO {
  /**
   * snapshotId из расчёта, который креатор видел и подтверждает
   * @format int64
   */
  snapshotId: number;
  /** Вариант из расчёта: ссылка в профиле; должен совпасть с текущим выбором */
  withLink?: boolean;
  /** Вариант из расчёта: промокод в закрепе; должен совпасть с текущим выбором */
  withPromo?: boolean;
  /**
   * Скриншот профиля со ссылкой из /api/files/placement-proof/presign; обязателен, если автопроверка ссылку не нашла
   * @minLength 0
   * @maxLength 512
   */
  linkProofKey?: string;
  /**
   * Скриншот или запись экрана с закреплённым комментарием; обязателен для надбавки за промокод
   * @minLength 0
   * @maxLength 512
   */
  promoProofKey?: string;
  /**
   * Ссылка на сам закреплённый комментарий, если площадка её даёт
   * @minLength 0
   * @maxLength 1024
   */
  promoCommentUrl?: string;
  /** Комментарий заказчику */
  comment?: string;
}

/** Ролик для расчёта работы «ссылка и промокод» */
export interface SnapshotQuoteRequestDTO {
  /**
   * Ссылка на выложенный ролик: YouTube, TikTok или Instagram
   * @minLength 0
   * @maxLength 1024
   * @example "https://www.tiktok.com/@demo/video/123"
   */
  videoUrl: string;
}

/** Предварительный расчёт работы «ссылка и промокод» по свежему снимку просмотров. Подтверждается подачей с тем же snapshotId, пока не истёк expiresAt */
export interface SnapshotQuoteDTO {
  /**
   * Номер снимка: его подтверждает подача
   * @format int64
   */
  snapshotId?: number;
  /** Когда сняты просмотры, ISO-8601 */
  capturedAt?: string;
  /** До какого момента расчёт можно подтвердить, ISO-8601 */
  expiresAt?: string;
  /**
   * Откуда просмотры
   * @example "ScrapeCreators"
   */
  source?: string;
  /** Ссылка на ролик, развёрнутая до полной */
  videoUrl?: string;
  /**
   * Площадка ролика
   * @example "TikTok"
   */
  platformDescription?: string;
  /** Когда ролик опубликован, ISO-8601; null — площадка не отдала */
  videoPublishedAt?: string;
  /**
   * Все просмотры ролика на момент снимка
   * @format int64
   */
  views?: number;
  /**
   * Просмотры из региона объявления
   * @format int64
   */
  payableViews?: number;
  /** Известна ли география (для «весь мир» всегда true) */
  geographyKnown?: boolean;
  /**
   * Оплачиваемые просмотры: после потолка новичка, округлены вниз до сотен
   * @format int64
   */
  billableViews?: number;
  /** Просмотры урезаны потолком для новых креаторов */
  cappedForNewCreator?: boolean;
  /**
   * Порог оплаты объявления; null — без порога
   * @format int64
   */
  minPaidViews?: number;
  /** Ролик не дотянул до порога оплаты: сумма 0 */
  belowMinPaidViews?: boolean;
  /**
   * Ставка за 1000 просмотров, в копейках: база
   * @format int64
   */
  baseRatePerThousandKopecks?: number;
  /**
   * Надбавка за ссылку, в копейках за 1000 просмотров
   * @format int64
   */
  linkBonusPerThousandKopecks?: number;
  /**
   * Надбавка за промокод, в копейках за 1000 просмотров
   * @format int64
   */
  promoBonusPerThousandKopecks?: number;
  /**
   * Ставка выбранного варианта
   * @format int64
   */
  rateKopecks?: number;
  /** Выбрана надбавка за ссылку */
  withLink?: boolean;
  /** Выбрана надбавка за промокод */
  withPromo?: boolean;
  /**
   * База, в копейках
   * @format int64
   */
  baseKopecks?: number;
  /**
   * Надбавка за ссылку, в копейках; 0 — не выбрана
   * @format int64
   */
  linkKopecks?: number;
  /**
   * Надбавка за промокод, в копейках; 0 — не выбрана
   * @format int64
   */
  promoKopecks?: number;
  /**
   * База и надбавки до потолка на ролик и остатка бюджета
   * @format int64
   */
  grossKopecks?: number;
  /**
   * Потолок вознаграждения за ролик; null — без потолка
   * @format int64
   */
  maxRewardPerVideoKopecks?: number;
  /**
   * Остаток бюджета объявления
   * @format int64
   */
  budgetRemainingKopecks?: number;
  /** Сумма упёрлась в потолок на ролик или остаток бюджета */
  limited?: boolean;
  /**
   * Сумма работы при подтверждении всех выбранных надбавок
   * @format int64
   */
  totalKopecks?: number;
  /**
   * Сумма, если ни одну надбавку не подтвердят: только база
   * @format int64
   */
  baseOnlyKopecks?: number;
  /** Комиссия платформы при выводе, % */
  commissionPercent?: number;
  /**
   * Комиссия с totalKopecks
   * @format int64
   */
  commissionKopecks?: number;
  /**
   * totalKopecks после комиссии
   * @format int64
   */
  netKopecks?: number;
  /** Автопроверка ссылки в профиле: FOUND, MISSING, UNKNOWN; null — ссылка не выбрана */
  linkCheckState?: string;
  /** Человекочитаемый итог автопроверки */
  linkCheckStateDescription?: string;
  /** Что увидела автопроверка */
  linkCheckDetail?: string;
  /**
   * Сколько дней держать ссылку и закреп после подачи
   * @format int32
   */
  retentionDays?: number;
  /** До какого момента держать ссылку и закреп, если подать сейчас, ISO-8601 */
  retainUntil?: string;
}

/** Отклик в очереди антифрода: сам отклик, последний замер и решение админа */
export interface FraudApplicationDTO {
  /** Отклик креатора: и в списке заказчика, и в списке креатора */
  application?: ApplicationDTO;
  creatorEmail?: string;
  /**
   * Подписчики аккаунта креатора на площадке ролика; null — неизвестно
   * @format int64
   */
  creatorFollowers?: number;
  /** Замер просмотров ролика в конкретный момент */
  latestSnapshot?: ViewSnapshotDTO;
  /**
   * Начислено, но ещё не зачислено в кошелёк, в копейках
   * @format int64
   */
  uncreditedKopecks?: number;
  fraudCheckedAt?: string;
  fraudReviewedAt?: string;
  /** Имя админа, принявшего решение */
  fraudReviewedBy?: string;
  fraudReviewComment?: string;
}

/** Замер просмотров ролика в конкретный момент */
export interface ViewSnapshotDTO {
  /** Когда сняли замер, ISO-8601 */
  capturedAt?: string;
  /**
   * Просмотры на момент замера
   * @format int64
   */
  views?: number;
  /** Просмотры по странам (ISO 3166-1 alpha-2); null — площадка географию не отдала */
  countryViews?: Record<string, number>;
  /** Откуда взяли: YOUTUBE_API, TIKTOK_API, INSTAGRAM_API, MANUAL */
  source?: string;
  /** Человекочитаемый источник */
  sourceDescription?: string;
  /**
   * Лайки; null — площадка не отдала
   * @format int64
   */
  likes?: number;
  /** @format int64 */
  comments?: number;
  /** @format int64 */
  shares?: number;
  /** @format int64 */
  saves?: number;
  /**
   * Охват — уникальные аккаунты (Instagram)
   * @format int64
   */
  reach?: number;
  /**
   * Просмотры с досмотром (YouTube engagedViews)
   * @format int64
   */
  engagedViews?: number;
  /**
   * Среднее время просмотра, секунды
   * @format double
   */
  avgWatchSeconds?: number;
  /**
   * Средний процент досмотра (YouTube)
   * @format double
   */
  avgViewPercentage?: number;
  /** Просмотры по источникам трафика (YouTube) */
  trafficSources?: Record<string, number>;
}

/** Просмотры ролика от внешнего анализатора */
export interface ViewsUpdateRequestDTO {
  /**
   * Накопленное число просмотров ролика
   * @format int64
   * @example 12400
   */
  views: number;
  /** Просмотры по странам, коды ISO 3166-1 alpha-2, например {"RU": 12000, "KZ": 300}; null — география неизвестна */
  countryViews?: Record<string, number>;
}

/** Смена статуса объявления */
export interface CampaignStatusUpdateRequestDTO {
  /**
   * Новый статус: DRAFT, ACTIVE, PAUSED или COMPLETED
   * @example "ACTIVE"
   */
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
}

/** Решение по отклику: заказчика или менеджера на модерации */
export interface ApplicationStatusUpdateRequestDTO {
  /**
   * Новый статус: APPROVED, REJECTED или COMPLETED
   * @example "APPROVED"
   */
  status: "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  /**
   * Причина отказа: обязательна для REJECTED, её видит креатор
   * @minLength 0
   * @maxLength 2000
   * @example "Ролик не по брифу"
   */
  reason?: string;
}

/** Решение модератора или заказчика по одной надбавке */
export interface PlacementDecisionRequestDTO {
  /** VERIFIED — подтвердить, REJECTED — не подтверждать (нужна причина) */
  decision: "NOT_SELECTED" | "PENDING" | "VERIFIED" | "EARNED" | "REJECTED";
  /** Причина отказа; её увидит креатор */
  reason?: string;
}

/** Ручная смена репутации креатора */
export interface TrustUpdateRequestDTO {
  /** NEW, TRUSTED, RESTRICTED, BLOCKED; null — снять ручную отметку и вернуть автоматике */
  trustLevel?: "NEW" | "TRUSTED" | "RESTRICTED" | "BLOCKED";
  /**
   * @minLength 0
   * @maxLength 2000
   */
  note?: string;
}

/** Креатор с репутацией и историей проверок */
export interface CreatorTrustDTO {
  /** @format int64 */
  userId?: number;
  name?: string;
  email?: string;
  /** NEW, TRUSTED, RESTRICTED, BLOCKED */
  trustLevel?: string;
  trustLevelDescription?: string;
  /** Уровень выставлен админом руками */
  manual?: boolean;
  note?: string;
  updatedAt?: string;
  /** Кто менял; null — автоматика */
  updatedBy?: string;
  /**
   * Подтверждённых накруток
   * @format int32
   */
  strikes?: number;
  /**
   * Роликов на проверке
   * @format int32
   */
  suspicious?: number;
  /**
   * Чистых оплаченных роликов
   * @format int32
   */
  cleanPaid?: number;
  /**
   * Всего откликов
   * @format int32
   */
  totalApplications?: number;
  registeredAt?: string;
}

/** Решение админа по отклику */
export interface FraudReviewRequestDTO {
  /** VERIFIED — честно, FRAUD — накрутка, AUTO — вернуть автоматике */
  decision: "VERIFIED" | "FRAUD" | "AUTO";
  /**
   * @minLength 0
   * @maxLength 2000
   */
  comment?: string;
}

/** Кошелёк заказчика: свободные деньги и сколько уже распределено по объявлениям */
export interface WalletDTO {
  /**
   * ID пользователя-заказчика
   * @format int64
   */
  userId?: number;
  customerName?: string;
  /** Почта заказчика, она же логин */
  customerEmail?: string;
  /** Компания заказчика; null — профиль не заполнен */
  customerCompany?: string;
  /**
   * Свободные средства, в копейках
   * @format int64
   */
  balanceKopecks?: number;
  /**
   * Сумма бюджетов всех объявлений заказчика, в копейках
   * @format int64
   */
  allocatedKopecks?: number;
  /**
   * Уже начислено креаторам по всем объявлениям, в копейках
   * @format int64
   */
  spentKopecks?: number;
  /** Адрес TRON платформы для пополнения USDT (TRC-20); null — не настроен */
  topUpTronAddress?: string;
  /**
   * Комиссия платформы, %: при пополнении платится сверху суммы, при выводе удерживается
   * @example 10
   */
  commissionPercent?: number;
  updatedAt?: string;
}

/** Строка списка операций: суть, откуда → куда и статус; подробности — отдельной ручкой по publicId */
export interface OperationRowDTO {
  /**
   * Публичный номер операции для ссылок
   * @example "K7Q2M9XA"
   */
  publicId?: string;
  /** Тип: TOP_UP, WITHDRAWAL, ALLOCATION, RELEASE, EARNING, PAYOUT, REFERRAL_REWARD */
  type?: string;
  /**
   * Что за операция
   * @example "Начисление за просмотры"
   */
  title?: string;
  /** Уточнение: объявление или комментарий; может быть null */
  subtitle?: string;
  /**
   * Сумма в копейках со знаком относительно кошелька
   * @format int64
   */
  amountKopecks?: number;
  /** Статус: DONE, PENDING, SENT, CONFIRMED, REJECTED, CANCELLED */
  status?: string;
  statusDescription?: string;
  /** Чей кошелёк */
  ownerName?: string;
  /** Одна сторона движения денег: откуда они ушли или куда пришли */
  source?: FlowPointDTO;
  /** Одна сторона движения денег: откуда они ушли или куда пришли */
  destination?: FlowPointDTO;
  createdAt?: string;
}

export interface Telegram {
  botEnabled?: boolean;
  botUsername?: string;
  botUrl?: string;
  linked?: boolean;
  telegramUsername?: string;
  /** @format date-time */
  linkedAt?: string;
}

export interface Preset {
  id?: string;
  name?: string;
  url?: string;
}

export interface StudioOverviewDTO {
  admin?: boolean;
  unlimited?: boolean;
  /** @format int32 */
  dailyLimit?: number;
  /** @format int32 */
  remaining?: number;
  /** @format int32 */
  maxActive?: number;
  /** @format int32 */
  active?: number;
  /** @format date-time */
  quotaResetsAt?: string;
  /** @format int64 */
  sourceMaxBytes?: number;
  /** @format int64 */
  bannerMaxBytes?: number;
  /** @format int64 */
  backgroundMaxBytes?: number;
  rendererAvailable?: boolean;
  /** @format uuid */
  activeTemplateId?: string;
  /** @format uuid */
  favoriteTemplateId?: string;
  telegram?: Telegram;
  presets?: Preset[];
}

/** Как сейчас привязываются аккаунты соцсетей */
export interface SocialModeDTO {
  /**
   * OAUTH — вход на площадке (/authorize), SCRAPE — ник и код в описании профиля (/verification)
   * @example "SCRAPE"
   */
  mode?: string;
  /** Привязка настроена на сервере; false — ручки отвечают 503 */
  available?: boolean;
}

/** Курс USDT/RUB на бирже Rapira: сколько рублей стоит 1 USDT */
export interface UsdtRateDTO {
  /**
   * Цена покупки 1 USDT в рублях
   * @example 86.76
   */
  askPrice?: number;
  /**
   * Цена продажи 1 USDT в рублях
   * @example 86.73
   */
  bidPrice?: number;
  /** Когда курс получен с биржи, ISO-8601 */
  fetchedAt?: string;
  /**
   * Источник курса
   * @example "Rapira"
   */
  source?: string;
}

/** Кто пригласил: показывается на лендинге рекламодателя по коду из ссылки */
export interface PartnerInviteDTO {
  /**
   * Код приглашения
   * @example "K7Q2M9XA"
   */
  code?: string;
  /** Имя партнёра */
  name?: string;
  /** Компания партнёра; null — не указана в профиле */
  company?: string;
}

/** Карточка объявления на публичной доске */
export interface CampaignBoardDTO {
  /** @format uuid */
  id?: string;
  /** Короткий номер для публичных ссылок */
  publicId?: string;
  title?: string;
  /** Временная ссылка на фотографию; null — фото не загружено */
  photoUrl?: string;
  /**
   * Ставка за 1000 просмотров, в копейках
   * @format int64
   */
  ratePerThousandKopecks?: number;
  /**
   * Выделенный бюджет, в копейках
   * @format int64
   */
  budgetKopecks?: number;
  /**
   * Уже начислено креаторам, в копейках
   * @format int64
   */
  spentKopecks?: number;
  /**
   * Остаток бюджета, в копейках
   * @format int64
   */
  remainingKopecks?: number;
  /**
   * С какой накопленной по объявлению суммы креатор может выводить заработанное, в копейках
   * @format int64
   */
  minPayoutKopecks?: number;
  /** Площадки, с которых принимаются ролики: INSTAGRAM, TIKTOK, YOUTUBE_SHORTS */
  platforms?: string[];
  /** Регион, просмотры из которого оплачиваются: CIS, WORLD */
  viewRegion?: string;
  /**
   * Человекочитаемый регион просмотров
   * @example "СНГ"
   */
  viewRegionDescription?: string;
  /**
   * Минимальная длина ролика в секундах; null — без ограничения
   * @format int32
   */
  minVideoSeconds?: number;
  /**
   * Сколько просмотров должен набрать ролик, чтобы его оплатили; null — оплачиваются все
   * @format int64
   */
  minPaidViews?: number;
  /**
   * Сколько роликов может подать один креатор; null — без ограничения
   * @format int32
   */
  maxVideosPerCreator?: number;
  /** С какого момента принимаются отклики, ISO-8601; null — сразу */
  startsAt?: string;
  /** До какого момента принимаются отклики, ISO-8601; null — бессрочно */
  endsAt?: string;
  /**
   * Сколько материалов приложил заказчик
   * @format int32
   */
  materialsCount?: number;
  /** Как платит объявление: CONTINUOUS или SNAPSHOT («ссылка и промокод») */
  paymentModel?: string;
  /**
   * Надбавка за ссылку в профиле, в копейках за 1000 просмотров; 0 — нет
   * @format int64
   */
  linkBonusPerThousandKopecks?: number;
  /**
   * Надбавка за промокод в закрепе, в копейках за 1000 просмотров; 0 — нет
   * @format int64
   */
  promoBonusPerThousandKopecks?: number;
  customerName?: string;
  /** Компания заказчика; null — профиль не заполнен */
  customerCompany?: string;
  /**
   * Всего откликов по объявлению
   * @format int32
   */
  applicationsCount?: number;
  createdAt?: string;
}

/** Объявление в своём сегменте — среди других запущенных объявлений той же тематики */
export interface CampaignSegmentDTO {
  /**
   * Код тематики; null — тематика не выбрана, сегмента нет
   * @example "TECH"
   */
  topic?: string;
  /**
   * Название тематики
   * @example "Технологии и гаджеты"
   */
  topicDescription?: string;
  /**
   * Сколько других запущенных объявлений в тематике
   * @format int64
   * @example 12
   */
  campaignsCount?: number;
  /** Хватает ли объявлений для сравнения; если нет — медианы и проценты пустые */
  comparable?: boolean;
  /**
   * С какого числа других объявлений тематики сравниваем
   * @format int32
   * @example 3
   */
  minCampaignsCount?: number;
  /** Ставка или бюджет объявления против других объявлений его тематики */
  rate?: CampaignSegmentMetricDTO;
  /** Ставка или бюджет объявления против других объявлений его тематики */
  budget?: CampaignSegmentMetricDTO;
  /**
   * Средняя рыночная ставка за 1000 просмотров по тематике, в копейках; null — неизвестна: тематику добавил заказчик
   * @format int64
   * @example 20000
   */
  marketRatePerThousandKopecks?: number;
  /**
   * На сколько процентов ставка выше рыночной по тематике, со знаком; null — не с чем сравнить
   * @format int32
   * @example -10
   */
  marketRateDiffPercent?: number;
}

/** Ставка или бюджет объявления против других объявлений его тематики */
export interface CampaignSegmentMetricDTO {
  /**
   * Значение у этого объявления, в копейках; null — не заполнено
   * @format int64
   * @example 18000
   */
  kopecks?: number;
  /**
   * Медиана по другим объявлениям тематики, в копейках; null — сравнивать не с чем
   * @format int64
   * @example 15000
   */
  medianKopecks?: number;
  /**
   * На сколько процентов значение выше медианы, со знаком: −20 — ниже на 20%; null — сравнивать не с чем
   * @format int32
   * @example 20
   */
  diffPercent?: number;
  /**
   * У какой доли других объявлений тематики значение ниже, в процентах; null — сравнивать не с чем
   * @format int32
   * @example 75
   */
  higherThanPercent?: number;
}

/** Кошелёк креатора: сколько доступно к выводу и что уже было */
export interface CreatorWalletDTO {
  /** @format int64 */
  userId?: number;
  /**
   * Доступно к выводу, в копейках
   * @format int64
   */
  balanceKopecks?: number;
  /**
   * Зарезервировано в незакрытых заявках на вывод, в копейках
   * @format int64
   */
  reservedKopecks?: number;
  /**
   * Выведено по подтверждённым заявкам, в копейках
   * @format int64
   */
  paidOutKopecks?: number;
  /**
   * Всего зачислено в кошелёк за просмотры, в копейках
   * @format int64
   */
  earnedKopecks?: number;
  /**
   * Начислено по откликам, но ещё не в кошельке: ждёт порога вывода объявления или ночного зачисления, в копейках
   * @format int64
   */
  pendingKopecks?: number;
  /** Есть ли доступные деньги на заявку */
  payoutAvailable?: boolean;
  /**
   * Комиссия платформы с вывода, %: удерживается из суммы заявки
   * @example 10
   */
  commissionPercent?: number;
  updatedAt?: string;
}

/** Медианы по запущенным объявлениям площадки; пока объявлений нет — базовые значения */
export interface CampaignBenchmarkDTO {
  /**
   * Медианная ставка за 1000 просмотров, в копейках
   * @format int64
   * @example 15000
   */
  medianRatePerThousandKopecks?: number;
  /**
   * Медианный бюджет объявления, в копейках
   * @format int64
   * @example 10000000
   */
  medianBudgetKopecks?: number;
  /**
   * Минимальный бюджет, с которым объявление можно запустить, в копейках
   * @format int64
   * @example 1000000
   */
  minBudgetKopecks?: number;
  /**
   * Порог вывода объявления — не больше этого процента от его бюджета
   * @format int32
   * @example 10
   */
  maxPayoutBudgetPercent?: number;
  /** Самые популярные тематики, до 10, со средними ставками за 1000 просмотров, в порядке показа; остальные — поиском в /api/campaigns/topics */
  topics?: CampaignTopicDTO[];
}

/** Вкладка левого меню личного кабинета */
export interface CabinetTabDTO {
  /** Код вкладки, по нему фронт закрывает страницы раздела */
  key?: string;
  /** Адрес раздела во фронте */
  path?: string;
  /** Название в боковом меню */
  label?: string;
  /** Короткое название для нижней панели на телефоне */
  shortLabel?: string;
  /** Имя иконки из набора фронта */
  icon?: string;
  /** Подсвечивать только на точном совпадении адреса, без вложенных страниц */
  exact?: boolean;
}

/** Текущий пользователь */
export interface CurrentUserDTO {
  /** @format int64 */
  id?: number;
  /** Логин (e-mail) */
  username?: string;
  name?: string;
  /** Роль: CUSTOMER, CREATOR, FINANCE_MANAGER, ADMIN или SUPER_ADMIN */
  role?: string;
  /** Вкладки кабинета в порядке меню */
  tabs?: CabinetTabDTO[];
  /** Временная ссылка на аватарку; null — аватарки нет */
  avatarUrl?: string;
  /** Почта для входа; null — учётка заведена через Telegram и почты пока нет */
  email?: string;
  /** true — войти можно только через Telegram */
  telegramOnly?: boolean;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8090",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title traffic markering
 * @version 1.0.0
 * @baseUrl http://localhost:8090
 *
 * Документация API
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Studio
     * @name UpdateTemplate
     * @summary Изменить шаблон
     * @request PUT:/api/studio/templates/{id}
     * @secure
     */
    updateTemplate: (
      id: string,
      data: StudioTemplateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<StudioTemplateDTO, any>({
        path: `/api/studio/templates/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name DeleteTemplate
     * @summary Удалить шаблон
     * @request DELETE:/api/studio/templates/{id}
     * @secure
     */
    deleteTemplate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/studio/templates/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Профиль текущего заказчика; если его почему-то нет — заводится пустой, а не 404
     *
     * @tags Profile
     * @name GetCustomerProfile
     * @summary Мой профиль заказчика
     * @request GET:/api/profile/customer
     * @secure
     */
    getCustomerProfile: (params: RequestParams = {}) =>
      this.request<CustomerProfileDTO, any>({
        path: `/api/profile/customer`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Полное обновление полей; название компании попадает на карточку объявления
     *
     * @tags Profile
     * @name UpdateCustomerProfile
     * @summary Сохранить профиль заказчика
     * @request PUT:/api/profile/customer
     * @secure
     */
    updateCustomerProfile: (
      data: CustomerProfileRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CustomerProfileDTO, any>({
        path: `/api/profile/customer`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Профиль текущего креатора; если его почему-то нет — заводится пустой, а не 404
     *
     * @tags Profile
     * @name GetCreatorProfile
     * @summary Мой профиль креатора
     * @request GET:/api/profile/creator
     * @secure
     */
    getCreatorProfile: (params: RequestParams = {}) =>
      this.request<CreatorProfileDTO, any>({
        path: `/api/profile/creator`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Полное обновление полей; пустые строки сохраняются как «не заполнено». Ссылки на площадки видит заказчик при разборе откликов
     *
     * @tags Profile
     * @name UpdateCreatorProfile
     * @summary Сохранить профиль креатора
     * @request PUT:/api/profile/creator
     * @secure
     */
    updateCreatorProfile: (
      data: CreatorProfileRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CreatorProfileDTO, any>({
        path: `/api/profile/creator`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Привязывает загруженную картинку к учётной записи; прежняя аватарка заменяется
     *
     * @tags Profile
     * @name SetAvatar
     * @summary Сохранить аватарку
     * @request PUT:/api/profile/avatar
     * @secure
     */
    setAvatar: (data: AvatarRequestDTO, params: RequestParams = {}) =>
      this.request<AvatarDTO, any>({
        path: `/api/profile/avatar`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description В кабинете снова показывается первая буква имени
     *
     * @tags Profile
     * @name RemoveAvatar
     * @summary Убрать аватарку
     * @request DELETE:/api/profile/avatar
     * @secure
     */
    removeAvatar: (params: RequestParams = {}) =>
      this.request<AvatarDTO, any>({
        path: `/api/profile/avatar`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Только своё объявление; админ видит любое
     *
     * @tags Campaign
     * @name GetCampaign
     * @summary Объявление по id
     * @request GET:/api/campaigns/{id}
     * @secure
     */
    getCampaign: (id: string, params: RequestParams = {}) =>
      this.request<CampaignDTO, any>({
        path: `/api/campaigns/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Полное обновление полей: пустое поле в запросе очищает его. Черновик можно сохранять частично, остальные статусы требуют заполненного объявления, а запущенное нельзя вернуть в черновик; смена ставки или бюджета пересчитывает начисления по откликам
     *
     * @tags Campaign
     * @name UpdateCampaign
     * @summary Обновить объявление
     * @request PUT:/api/campaigns/{id}
     * @secure
     */
    updateCampaign: (
      id: string,
      data: CampaignCreateUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CampaignDTO, any>({
        path: `/api/campaigns/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только пока по объявлению нет откликов, иначе 409: удаление стёрло бы историю начислений креаторам
     *
     * @tags Campaign
     * @name DeleteCampaign
     * @summary Удалить объявление
     * @request DELETE:/api/campaigns/{id}
     * @secure
     */
    deleteCampaign: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/campaigns/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Ролик к отклику в статусе IN_PROGRESS: те же проверки площадки, аккаунта и дублей, что и при отклике со ссылкой. После этого отклик уходит заказчику на рассмотрение (PENDING)
     *
     * @tags Application
     * @name AttachVideo
     * @summary Приложить ролик к работе
     * @request PUT:/api/applications/{id}/video
     * @secure
     */
    attachVideo: (
      id: string,
      data: ApplicationVideoRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/video`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Какие надбавки креатор берёт на себя: ссылку в профиле, промокод в закрепе, оба или ни одной. Менять можно, пока работа не подана
     *
     * @tags Application
     * @name ChoosePlacements
     * @summary Вариант участия «ссылка и промокод»
     * @request PUT:/api/applications/{id}/placements
     * @secure
     */
    choosePlacements: (
      id: string,
      data: PlacementChoiceRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/placements`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Новое доказательство по надбавке link или promo после отказа или вместо прежнего: надбавка снова ждёт проверки, снимок просмотров и база не меняются
     *
     * @tags Application
     * @name ResubmitPlacementProof
     * @summary Исправить надбавку
     * @request PUT:/api/applications/{id}/placements/{kind}/proof
     * @secure
     */
    resubmitPlacementProof: (
      id: string,
      kind: string,
      data: PlacementProofRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/placements/${kind}/proof`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Заказчик сам заводит пополнение на сумму в копейках и получает адрес TRON платформы, куда перевести USDT. Баланс не меняется, пока финансист не подтвердит поступление. 503 — адрес для пополнения не настроен
     *
     * @tags Wallet
     * @name RequestTopUp
     * @summary Заявка на пополнение
     * @request POST:/api/wallet/top-ups
     * @secure
     */
    requestTopUp: (data: TopUpCreateRequestDTO, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/wallet/top-ups`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только из PENDING: скриншоты или файлы перевода обязательны, номер транзакции — по желанию. Заявка переходит в SENT и ждёт проверки финансиста
     *
     * @tags Wallet
     * @name MarkTopUpPaid
     * @summary Отметить заявку на пополнение оплаченной
     * @request POST:/api/wallet/top-ups/{publicId}/paid
     * @secure
     */
    markTopUpPaid: (
      publicId: string,
      data: TopUpPaidRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/wallet/top-ups/${publicId}/paid`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только пока заявка не оплачена (PENDING)
     *
     * @tags Wallet
     * @name CancelTopUp
     * @summary Отменить заявку на пополнение
     * @request POST:/api/wallet/top-ups/{publicId}/cancel
     * @secure
     */
    cancelTopUp: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/wallet/top-ups/${publicId}/cancel`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Только для вывода в статусе SENT: заказчик проверил поступление USDT и подтверждает его
     *
     * @tags Wallet
     * @name ConfirmWalletOperation
     * @summary Подтвердить вывод
     * @request POST:/api/wallet/operations/{publicId}/confirm
     * @secure
     */
    confirmWalletOperation: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/wallet/operations/${publicId}/confirm`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description То же, что делает ночной шедулер: по каждому отклику разница между начисленным и уже зачисленным уходит в кошелёк креатора. Ответ — сколько откликов зачислено
     *
     * @tags TechEarnings
     * @name CreditEarnings
     * @summary Начислить накопленное сейчас
     * @request POST:/api/tech/earnings/credit
     * @secure
     */
    creditEarnings: (params: RequestParams = {}) =>
      this.request<Record<string, number>, any>({
        path: `/api/tech/earnings/credit`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Presigned PUT: файл уходит в хранилище напрямую с тем же Content-Type. purpose: SOURCE | BANNER | BACKGROUND
     *
     * @tags Studio
     * @name Presign
     * @summary Ссылка на загрузку файла
     * @request POST:/api/studio/uploads/presign
     * @secure
     */
    presign: (data: StudioPresignRequestDTO, params: RequestParams = {}) =>
      this.request<StudioPresignResponseDTO, any>({
        path: `/api/studio/uploads/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name Templates
     * @summary Шаблоны монтажа
     * @request GET:/api/studio/templates
     * @secure
     */
    templates: (params: RequestParams = {}) =>
      this.request<StudioTemplateDTO[], any>({
        path: `/api/studio/templates`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name CreateTemplate
     * @summary Новый шаблон
     * @request POST:/api/studio/templates
     * @secure
     */
    createTemplate: (
      data: StudioTemplateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<StudioTemplateDTO, any>({
        path: `/api/studio/templates`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description templateId=null — выключить; favorite=true — избранный (первым в списке под видео)
     *
     * @tags Studio
     * @name SetActive
     * @summary Автошаблон или избранный шаблон для Telegram
     * @request POST:/api/studio/templates/active
     * @secure
     */
    setActive: (
      data: StudioActiveTemplateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/studio/templates/active`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Для всех ролей: через бота приходят уведомления и вход
     *
     * @tags Studio
     * @name TelegramStatus
     * @summary Привязан ли Telegram
     * @request GET:/api/studio/telegram/link
     */
    telegramStatus: (params: RequestParams = {}) =>
      this.request<Telegram, any>({
        path: `/api/studio/telegram/link`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Одноразовая, действует 10 минут
     *
     * @tags Studio
     * @name Link
     * @summary Ссылка для привязки Telegram
     * @request POST:/api/studio/telegram/link
     * @secure
     */
    link: (params: RequestParams = {}) =>
      this.request<StudioTelegramLinkDTO, any>({
        path: `/api/studio/telegram/link`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name Unlink
     * @summary Отвязать Telegram
     * @request DELETE:/api/studio/telegram/link
     * @secure
     */
    unlink: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/studio/telegram/link`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description filter: all | active | done | failed
     *
     * @tags Studio
     * @name Jobs
     * @summary Мои видео
     * @request GET:/api/studio/jobs
     * @secure
     */
    jobs: (
      query?: {
        /** @default "all" */
        filter?: string;
        /**
         * @format int32
         * @default 50
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<StudioJobDTO[], any>({
        path: `/api/studio/jobs`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Ставит задачу в очередь; для профиля 9:16 + 1:1 — две задачи одного пакета
     *
     * @tags Studio
     * @name Create
     * @summary Собрать видео
     * @request POST:/api/studio/jobs
     * @secure
     */
    create: (data: StudioJobRequestDTO, params: RequestParams = {}) =>
      this.request<StudioJobDTO[], any>({
        path: `/api/studio/jobs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Нужна привязка Telegram; квоту не тратит
     *
     * @tags Studio
     * @name SendToTelegram
     * @summary Прислать готовый MP4 в Telegram
     * @request POST:/api/studio/jobs/{id}/telegram
     * @secure
     */
    sendToTelegram: (id: string, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/studio/jobs/${id}/telegram`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Нужны сохранённые исходники (keepSource). quality: null или "720"
     *
     * @tags Studio
     * @name Retry
     * @summary Повторить задачу
     * @request POST:/api/studio/jobs/{id}/retry
     * @secure
     */
    retry: (
      id: string,
      data: StudioRetryRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<StudioJobDTO, any>({
        path: `/api/studio/jobs/${id}/retry`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name Cancel
     * @summary Отменить задачу
     * @request POST:/api/studio/jobs/{id}/cancel
     * @secure
     */
    cancel: (id: string, params: RequestParams = {}) =>
      this.request<StudioJobDTO, any>({
        path: `/api/studio/jobs/${id}/cancel`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Свои баннеры и фоны и общий каталог
     *
     * @tags Studio
     * @name Assets
     * @summary Библиотека
     * @request GET:/api/studio/assets
     * @secure
     */
    assets: (params: RequestParams = {}) =>
      this.request<StudioAssetDTO[], any>({
        path: `/api/studio/assets`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description shared=true — в общий каталог (только админ)
     *
     * @tags Studio
     * @name SaveAsset
     * @summary Сохранить файл в библиотеку
     * @request POST:/api/studio/assets
     * @secure
     */
    saveAsset: (data: StudioAssetRequestDTO, params: RequestParams = {}) =>
      this.request<StudioAssetDTO, any>({
        path: `/api/studio/assets`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только в режиме SCRAPE. Ничего не сохраняет: код один и тот же при каждом запросе для пары «креатор — аккаунт». Платформа в пути: instagram, tiktok, youtube
     *
     * @tags SocialAccounts
     * @name StartVerification
     * @summary Найти профиль и получить проверочный код
     * @request POST:/api/social/{platform}/verification
     * @secure
     */
    startVerification: (
      platform: string,
      data: SocialVerificationRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<SocialVerificationDTO, any>({
        path: `/api/social/${platform}/verification`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только в режиме SCRAPE. Перечитывает профиль и привязывает аккаунт, если код на месте; после привязки код из описания можно убрать
     *
     * @tags SocialAccounts
     * @name ConfirmVerification
     * @summary Подтвердить аккаунт кодом в описании профиля
     * @request POST:/api/social/{platform}/verification/confirm
     * @secure
     */
    confirmVerification: (
      platform: string,
      data: SocialVerificationRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<SocialAccountDTO, any>({
        path: `/api/social/${platform}/verification/confirm`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только в режиме OAUTH. Возвращает адрес страницы согласия площадки: фронт открывает его в браузере. Платформа в пути: instagram, tiktok, youtube
     *
     * @tags SocialAccounts
     * @name Authorize
     * @summary Начать привязку аккаунта
     * @request POST:/api/social/{platform}/authorize
     * @secure
     */
    authorize: (platform: string, params: RequestParams = {}) =>
      this.request<SocialAuthorizeResponseDTO, any>({
        path: `/api/social/${platform}/authorize`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Presigned PUT-ссылка: картинка отправляется в хранилище напрямую, с тем же Content-Type. Полученный key передаётся в PUT /api/profile/avatar
     *
     * @tags Profile
     * @name PresignAvatar
     * @summary Ссылка на загрузку аватарки
     * @request POST:/api/profile/avatar/presign
     * @secure
     */
    presignAvatar: (
      data: PresignUploadRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDTO, any>({
        path: `/api/profile/avatar/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Условия программы, а если она подключена — код приглашения, приглашённые и начисления
     *
     * @tags Partner
     * @name MyPartner
     * @summary Моя партнёрская программа
     * @request GET:/api/partner
     * @secure
     */
    myPartner: (params: RequestParams = {}) =>
      this.request<PartnerDTO, any>({
        path: `/api/partner`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Заводит партнёра с кодом приглашения и открывает вкладку «Рефералка»; повторный вызов ничего не меняет
     *
     * @tags Partner
     * @name ActivatePartner
     * @summary Стать партнёром
     * @request POST:/api/partner
     * @secure
     */
    activatePartner: (params: RequestParams = {}) =>
      this.request<PartnerDTO, any>({
        path: `/api/partner`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Пока заявка открыта (PENDING или SENT): USDT пришли на адрес платформы, сумма зачисляется на баланс заказчика, заявка переходит в CONFIRMED
     *
     * @tags Finance
     * @name ConfirmTopUp
     * @summary Подтвердить поступление по заявке на пополнение
     * @request POST:/api/finance/top-ups/{publicId}/confirm
     * @secure
     */
    confirmTopUp: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/finance/top-ups/${publicId}/confirm`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Только из PENDING. Номер транзакции и скриншоты обязательны; заявка переходит в SENT и ждёт подтверждения креатора
     *
     * @tags Finance
     * @name MarkPayoutSent
     * @summary Отметить выплату отправленной
     * @request POST:/api/finance/payouts/{publicId}/sent
     * @secure
     */
    markPayoutSent: (
      publicId: string,
      data: TransferSentRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/finance/payouts/${publicId}/sent`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Пока операция открыта (PENDING или SENT): владелец кошелька видит причину. По выводу и выплате деньги возвращаются в кошелёк; по заявке на пополнение ничего не зачислялось, она просто закрывается
     *
     * @tags Finance
     * @name RejectOperation
     * @summary Отклонить пополнение, вывод или выплату
     * @request POST:/api/finance/operations/{publicId}/reject
     * @secure
     */
    rejectOperation: (
      publicId: string,
      data: TransferRejectRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/finance/operations/${publicId}/reject`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только из свободного остатка (409, если не хватает): USDT уже отправлены на адрес TRON заказчика, номер транзакции и скриншоты обязательны. Операция в SENT ждёт подтверждения заказчика
     *
     * @tags Finance
     * @name WithdrawFromWallet
     * @summary Вывести заказчику из кошелька
     * @request POST:/api/finance/customers/{userId}/withdrawal
     * @secure
     */
    withdrawFromWallet: (
      userId: number,
      data: WalletOperationRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/finance/customers/${userId}/withdrawal`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Presigned PUT-ссылка на скриншот или PDF перевода USDT. Заказчик прикладывает его к своей заявке на пополнение, менеджер финансов — к выводу заказчику или выплате креатору
     *
     * @tags File
     * @name PresignTransferProof
     * @summary Ссылка на загрузку подтверждения перевода
     * @request POST:/api/files/transfer-proof/presign
     * @secure
     */
    presignTransferProof: (
      data: PresignUploadRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDTO, any>({
        path: `/api/files/transfer-proof/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Presigned PUT-ссылка для креатора: скриншот профиля с рекламной ссылкой или запись экрана с закреплённым комментарием и промокодом. Полученный key передаётся при подаче работы «ссылка и промокод» или при исправлении надбавки
     *
     * @tags File
     * @name PresignPlacementProof
     * @summary Ссылка на загрузку доказательства размещения
     * @request POST:/api/files/placement-proof/presign
     * @secure
     */
    presignPlacementProof: (
      data: PresignUploadRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDTO, any>({
        path: `/api/files/placement-proof/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Возвращает presigned PUT-ссылку: файл отправляется в хранилище напрямую, с тем же Content-Type, что в запросе. Полученный key передаётся при сохранении объявления
     *
     * @tags File
     * @name PresignCampaignPhoto
     * @summary Ссылка на загрузку фото объявления
     * @request POST:/api/files/campaign-photo/presign
     * @secure
     */
    presignCampaignPhoto: (
      data: PresignUploadRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDTO, any>({
        path: `/api/files/campaign-photo/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Presigned PUT-ссылка на файл для креатора: бриф, баннер, референсы. Полученный key передаётся в materials при сохранении объявления вместе с именем, типом и размером файла
     *
     * @tags File
     * @name PresignCampaignMaterial
     * @summary Ссылка на загрузку материала объявления
     * @request POST:/api/files/campaign-material/presign
     * @secure
     */
    presignCampaignMaterial: (
      data: PresignUploadRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDTO, any>({
        path: `/api/files/campaign-material/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Сумма резервируется сразу, заявка уходит финансисту в статусе PENDING; 400 — адрес не TRC-20, 409 — не хватает доступных денег
     *
     * @tags Earnings
     * @name RequestPayout
     * @summary Заявка на вывод
     * @request POST:/api/earnings/payouts
     * @secure
     */
    requestPayout: (data: PayoutCreateRequestDTO, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/earnings/payouts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Только для заявки в статусе SENT: креатор увидел USDT на своём кошельке
     *
     * @tags Earnings
     * @name ConfirmPayout
     * @summary Подтвердить получение
     * @request POST:/api/earnings/payouts/{publicId}/confirm
     * @secure
     */
    confirmPayout: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/earnings/payouts/${publicId}/confirm`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Только пока финансист её не отправил (PENDING); деньги возвращаются в доступные
     *
     * @tags Earnings
     * @name CancelPayout
     * @summary Отменить заявку
     * @request POST:/api/earnings/payouts/{publicId}/cancel
     * @secure
     */
    cancelPayout: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/earnings/payouts/${publicId}/cancel`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Объявления текущего заказчика, новые сверху; суммы в копейках
     *
     * @tags Campaign
     * @name MyCampaigns
     * @summary Мои объявления
     * @request GET:/api/campaigns
     * @secure
     */
    myCampaigns: (params: RequestParams = {}) =>
      this.request<CampaignDTO[], any>({
        path: `/api/campaigns`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Ставка и бюджет в копейках; platforms — с каких площадок принимаются ролики; статус можно не передавать — тогда объявление создаётся черновиком; второй незаконченный черновик создать нельзя — 409
     *
     * @tags Campaign
     * @name CreateCampaign
     * @summary Создать объявление
     * @request POST:/api/campaigns
     * @secure
     */
    createCampaign: (
      data: CampaignCreateUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CampaignDTO, any>({
        path: `/api/campaigns`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Тематики, в названии которых есть query, без учёта регистра, «ё» и лишних пробелов: сначала начинающиеся с него, дальше — по числу запущенных объявлений. Без query — самые популярные. limit — от 1 до 20
     *
     * @tags Campaign
     * @name SearchCampaignTopics
     * @summary Поиск тематик
     * @request GET:/api/campaigns/topics
     * @secure
     */
    searchCampaignTopics: (
      query?: {
        query?: string;
        /**
         * @format int32
         * @default 10
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<CampaignTopicDTO[], any>({
        path: `/api/campaigns/topics`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Когда подходящей не нашлось поиском. Если такая уже есть — без учёта регистра, «ё» и лишних пробелов — возвращается она, дубль не заводится. Первая буква становится заглавной; средней ставки у добавленной тематики нет
     *
     * @tags Campaign
     * @name CreateCampaignTopic
     * @summary Добавить тематику
     * @request POST:/api/campaigns/topics
     * @secure
     */
    createCampaignTopic: (
      data: CampaignTopicCreateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CampaignTopicDTO, any>({
        path: `/api/campaigns/topics`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description У заказчика не больше одного незаконченного черновика. Без restart возвращает его, если он есть, иначе создаёт пустой; с restart=true удаляет незаконченный черновик, возвращая его бюджет в кошелёк, и создаёт пустой. Черновик заполняется по шагам через PUT
     *
     * @tags Campaign
     * @name StartCampaignDraft
     * @summary Начать новое объявление
     * @request POST:/api/campaigns/drafts
     * @secure
     */
    startCampaignDraft: (
      query?: {
        /** @default false */
        restart?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<CampaignDTO, any>({
        path: `/api/campaigns/drafts`,
        method: "POST",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Код живёт 10 минут, не больше 5 попыток ввода. Ответ: token (Bearer), role, email, name
     *
     * @tags Auth
     * @name Verify
     * @summary Обменять код на JWT
     * @request POST:/api/auth/verify
     */
    verify: (data: VerifyCodeDTO, params: RequestParams = {}) =>
      this.request<AuthResponseDTO, any>({
        path: `/api/auth/verify`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Принимает Telegram.WebApp.initData, проверяет подпись бота. Привязанный Telegram — сразу JWT; непривязанный — NEED_ACCOUNT, затем повторный запрос с action cr/cu/have
     *
     * @tags Auth
     * @name TelegramWebApp
     * @summary Вход из мини-приложения Telegram
     * @request POST:/api/auth/telegram/webapp
     */
    telegramWebApp: (
      data: TelegramWebAppRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<TelegramWebAppDTO, any>({
        path: `/api/auth/telegram/webapp`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Отдаёт ссылку в бота и секрет. Браузер открывает ссылку и опрашивает /telegram/poll. Роль передают только со страницы регистрации — для новой учётки
     *
     * @tags Auth
     * @name TelegramStart
     * @summary Вход через Telegram: начать
     * @request POST:/api/auth/telegram/start
     */
    telegramStart: (
      data: TelegramAuthStartRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<TelegramAuthStartDTO, any>({
        path: `/api/auth/telegram/start`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description PENDING — ждём бота, DONE — в ответе токен (выдаётся один раз), NEED_EMAIL — войдите по почте и вызовите /telegram/attach, CANCELLED, EXPIRED
     *
     * @tags Auth
     * @name TelegramPoll
     * @summary Вход через Telegram: результат
     * @request POST:/api/auth/telegram/poll
     */
    telegramPoll: (data: TelegramAuthSecretDTO, params: RequestParams = {}) =>
      this.request<TelegramAuthPollDTO, any>({
        path: `/api/auth/telegram/poll`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Для ответа NEED_EMAIL: человек подтвердил Telegram в боте, но учётки у него не было под этим Telegram — после входа по почте он привязывается к ней
     *
     * @tags Auth
     * @name TelegramAttach
     * @summary Привязать Telegram после входа по почте
     * @request POST:/api/auth/telegram/attach
     * @secure
     */
    telegramAttach: (data: TelegramAuthSecretDTO, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/auth/telegram/attach`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 404, если учётки с такой почтой нет; 429, если код уже уходил меньше 30 секунд назад
     *
     * @tags Auth
     * @name RequestCode
     * @summary Отправить код входа на почту
     * @request POST:/api/auth/request-code
     */
    requestCode: (data: RequestCodeDTO, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/auth/request-code`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Роль — CUSTOMER (заказчик) или CREATOR (креатор). Заводится учётка с пустым профилем нужного типа и на почту уходит код входа; токен выдаёт verify. 409, если почта уже занята подтверждённой учёткой
     *
     * @tags Auth
     * @name Register
     * @summary Регистрация
     * @request POST:/api/auth/register
     */
    register: (data: RegisterRequestDTO, params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/api/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Без code — отправляет письмо с кодом; с code — подтверждает, почта становится логином и в ответе новый токен. 409 — почта занята или у учётки уже есть почта
     *
     * @tags Auth
     * @name AddEmail
     * @summary Добавить почту к учётке из Telegram
     * @request POST:/api/auth/email
     * @secure
     */
    addEmail: (data: EmailCodeDTO, params: RequestParams = {}) =>
      this.request<object, any>({
        path: `/api/auth/email`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Без ссылки на ролик отклик встаёт в IN_PROGRESS: креатор снимает ролик и прикладывает его позже, повторный вызов возвращает тот же отклик. Со ссылкой площадка определяется по ней, должна быть среди площадок объявления, а аккаунт этой площадки должен быть привязан в профиле. Откликнуться можно только на активное объявление и не на своё, роликов на одно объявление можно подать сколько угодно; тот же ролик повторно — 409
     *
     * @tags Application
     * @name Apply
     * @summary Взять объявление в работу
     * @request POST:/api/applications
     * @secure
     */
    apply: (data: ApplicationCreateRequestDTO, params: RequestParams = {}) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Фиксирует просмотры и сумму из расчёта snapshotId; рост просмотров после подачи работу не меняет. Для надбавки за промокод нужен скриншот или запись экрана с закрепом; для ссылки — скриншот, если автопроверка её не нашла. Устаревший расчёт — 409
     *
     * @tags Application
     * @name SubmitWork
     * @summary Подать работу по расчёту
     * @request POST:/api/applications/{id}/submit
     * @secure
     */
    submitWork: (
      id: string,
      data: SnapshotSubmitRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/submit`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Проверяет ролик (площадка, аккаунт, дубли, выложен после взятия оффера), снимает свежие просмотры и проверяет ссылку в профиле. Возвращает расчёт: оплачиваемые просмотры, базу, надбавки, комиссию. Расчёт живёт 15 минут и подтверждается подачей
     *
     * @tags Application
     * @name QuoteWork
     * @summary Расчёт работы по снимку просмотров
     * @request POST:/api/applications/{id}/quote
     * @secure
     */
    quoteWork: (
      id: string,
      data: SnapshotQuoteRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<SnapshotQuoteDTO, any>({
        path: `/api/applications/${id}/quote`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Автопроверка ссылки по публичному профилю; найденная ссылка подтверждает ожидающую надбавку. Не чаще раза в минуту
     *
     * @tags Application
     * @name RecheckPlacementLink
     * @summary Проверить ссылку в профиле ещё раз
     * @request POST:/api/applications/{id}/placements/link/check
     * @secure
     */
    recheckPlacementLink: (id: string, params: RequestParams = {}) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/placements/link/check`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFraud
     * @name RecheckAll
     * @summary Перепроверить все ролики в работе
     * @request POST:/api/admin/fraud/recheck
     * @secure
     */
    recheckAll: (params: RequestParams = {}) =>
      this.request<Record<string, number>, any>({
        path: `/api/admin/fraud/recheck`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFraud
     * @name Recheck
     * @summary Перепроверить отклик
     * @request POST:/api/admin/fraud/applications/{id}/recheck
     * @secure
     */
    recheck: (id: string, params: RequestParams = {}) =>
      this.request<FraudApplicationDTO, any>({
        path: `/api/admin/fraud/applications/${id}/recheck`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Записывает накопленное число просмотров и время синхронизации, после чего пересчитывает начисления по всему объявлению: остаток бюджета режет выплату
     *
     * @tags TechViews
     * @name UpdateViews
     * @summary Проставить просмотры отклику
     * @request PATCH:/api/tech/applications/{id}/views
     * @secure
     */
    updateViews: (
      id: string,
      data: ViewsUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/tech/applications/${id}/views`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description На публичной доске показываются только объявления в статусе ACTIVE; из черновика можно выйти, только когда объявление заполнено, а вернуться в него нельзя
     *
     * @tags Campaign
     * @name UpdateCampaignStatus
     * @summary Сменить статус объявления
     * @request PATCH:/api/campaigns/{id}/status
     * @secure
     */
    updateCampaignStatus: (
      id: string,
      data: CampaignStatusUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CampaignDTO, any>({
        path: `/api/campaigns/${id}/status`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Заказчик объявления одобряет (APPROVED), отклоняет (REJECTED, причина обязательна) или завершает (COMPLETED) отклик. После смены статуса начисления по объявлению пересчитываются целиком
     *
     * @tags Application
     * @name UpdateApplicationStatus
     * @summary Решение по отклику
     * @request PATCH:/api/applications/{id}/status
     * @secure
     */
    updateApplicationStatus: (
      id: string,
      data: ApplicationStatusUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/status`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Заказчик объявления или модератор подтверждает (VERIFIED) или отклоняет (REJECTED, с причиной) надбавку link или promo. Отказ по надбавке не отклоняет ролик. Засчитанную надбавку не изменить
     *
     * @tags Application
     * @name DecidePlacement
     * @summary Решение по надбавке
     * @request PATCH:/api/applications/{id}/placements/{kind}/decision
     * @secure
     */
    decidePlacement: (
      id: string,
      kind: string,
      data: PlacementDecisionRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/placements/${kind}/decision`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description APPROVED — ролик принят, по нему начинают капать деньги; REJECTED — отказ с обязательной причиной, её видит креатор. Решить можно только отклик в статусе PENDING, иначе 409
     *
     * @tags AdminModeration
     * @name Moderate
     * @summary Решение модерации
     * @request PATCH:/api/admin/moderation/applications/{id}
     * @secure
     */
    moderate: (
      id: string,
      data: ApplicationStatusUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationDTO, any>({
        path: `/api/admin/moderation/applications/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Уровень выставляется руками и автоматикой больше не пересчитывается; trustLevel=null снимает ручную отметку
     *
     * @tags AdminFraud
     * @name UpdateTrust
     * @summary Сменить репутацию креатора
     * @request PATCH:/api/admin/fraud/creators/{userId}/trust
     * @secure
     */
    updateTrust: (
      userId: number,
      data: TrustUpdateRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<CreatorTrustDTO, any>({
        path: `/api/admin/fraud/creators/${userId}/trust`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description VERIFIED размораживает зачисление, FRAUD обнуляет начисление и даёт креатору страйк, AUTO возвращает отклик автоматике. Репутация креатора пересчитывается
     *
     * @tags AdminFraud
     * @name Review
     * @summary Решение по отклику
     * @request PATCH:/api/admin/fraud/applications/{id}/review
     * @secure
     */
    review: (
      id: string,
      data: FraudReviewRequestDTO,
      params: RequestParams = {},
    ) =>
      this.request<FraudApplicationDTO, any>({
        path: `/api/admin/fraud/applications/${id}/review`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Свободный остаток, сумма бюджетов объявлений и сколько уже начислено креаторам; суммы в копейках
     *
     * @tags Wallet
     * @name MyWallet
     * @summary Мой кошелёк
     * @request GET:/api/wallet
     * @secure
     */
    myWallet: (params: RequestParams = {}) =>
      this.request<WalletDTO, any>({
        path: `/api/wallet`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Короткие строки: что за операция, откуда → куда, сумма и статус; подробности — по publicId
     *
     * @tags Wallet
     * @name MyWalletOperations
     * @summary Операции по моему кошельку
     * @request GET:/api/wallet/operations
     * @secure
     */
    myWalletOperations: (params: RequestParams = {}) =>
      this.request<OperationRowDTO[], any>({
        path: `/api/wallet/operations`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Проводка с объявлением, комментарием, кто провёл и остатком после; для пополнения и вывода — ещё перевод: адрес TRON, номер транзакции, скриншоты и файлы
     *
     * @tags Wallet
     * @name MyWalletOperation
     * @summary Операция по моему кошельку целиком
     * @request GET:/api/wallet/operations/{publicId}
     * @secure
     */
    myWalletOperation: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/wallet/operations/${publicId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Лимиты, привязка Telegram, встроенные фоны
     *
     * @tags Studio
     * @name Overview
     * @summary Обзор студии
     * @request GET:/api/studio/overview
     * @secure
     */
    overview: (params: RequestParams = {}) =>
      this.request<StudioOverviewDTO, any>({
        path: `/api/studio/overview`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name Job
     * @summary Задача
     * @request GET:/api/studio/jobs/{id}
     * @secure
     */
    job: (id: string, params: RequestParams = {}) =>
      this.request<StudioJobDTO, any>({
        path: `/api/studio/jobs/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description OAUTH — кнопка ведёт на /{platform}/authorize; SCRAPE — креатор вводит ник, получает код через /{platform}/verification и подтверждает через /{platform}/verification/confirm
     *
     * @tags SocialAccounts
     * @name Mode
     * @summary Способ привязки аккаунтов
     * @request GET:/api/social/mode
     * @secure
     */
    mode: (params: RequestParams = {}) =>
      this.request<SocialModeDTO, any>({
        path: `/api/social/mode`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Сюда браузер приходит редиректом от площадки. Ручка открыта: пользователя опознаём по подписанному state, а не по заголовку авторизации
     *
     * @tags SocialAccounts
     * @name Callback
     * @summary Возврат с площадки после согласия
     * @request GET:/api/social/callback/{platform}
     */
    callback: (
      platform: string,
      query?: {
        code?: string;
        state?: string;
        error?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/social/callback/${platform}`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Все площадки одним списком; ограничения на количество нет
     *
     * @tags SocialAccounts
     * @name ListAccounts
     * @summary Мои привязанные аккаунты
     * @request GET:/api/social/accounts
     * @secure
     */
    listAccounts: (params: RequestParams = {}) =>
      this.request<SocialAccountDTO[], any>({
        path: `/api/social/accounts`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name Preset
     * @summary Картинка встроенного фона
     * @request GET:/api/public/studio/presets/{id}.jpg
     */
    preset: (id: string, params: RequestParams = {}) =>
      this.request<Blob, any>({
        path: `/api/public/studio/presets/${id}.jpg`,
        method: "GET",
        format: "blob",
        ...params,
      }),

    /**
     * @description Берётся с биржи Rapira и кешируется на минуту; если биржа недоступна — отдаётся последний полученный курс, без него 502
     *
     * @tags Rates
     * @name Usdt
     * @summary Курс USDT/RUB
     * @request GET:/api/public/rates/usdt
     */
    usdt: (params: RequestParams = {}) =>
      this.request<UsdtRateDTO, any>({
        path: `/api/public/rates/usdt`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Имя и компания партнёра по коду из ссылки-приглашения; 404 — код не найден
     *
     * @tags Partner
     * @name PartnerInvite
     * @summary Кто пригласил
     * @request GET:/api/public/partners/{code}
     */
    partnerInvite: (code: string, params: RequestParams = {}) =>
      this.request<PartnerInviteDTO, any>({
        path: `/api/public/partners/${code}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Витрина креатора: отображаемое имя, «о себе» и соцсети — заказчик смотрит, кому отдаёт заказ
     *
     * @tags PublicBoard
     * @name PublicCreator
     * @summary Профиль креатора
     * @request GET:/api/public/creators/{userId}
     */
    publicCreator: (userId: number, params: RequestParams = {}) =>
      this.request<CreatorProfileDTO, any>({
        path: `/api/public/creators/${userId}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Только объявления в статусе ACTIVE, новые сверху; описание урезано до 180 символов
     *
     * @tags PublicBoard
     * @name BoardCampaigns
     * @summary Доска объявлений
     * @request GET:/api/public/campaigns
     */
    boardCampaigns: (params: RequestParams = {}) =>
      this.request<CampaignBoardDTO[], any>({
        path: `/api/public/campaigns`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Полная карточка объявления для страницы отклика; суммы в копейках
     *
     * @tags PublicBoard
     * @name BoardCampaign
     * @summary Объявление по публичному номеру
     * @request GET:/api/public/campaigns/{publicId}
     */
    boardCampaign: (publicId: string, params: RequestParams = {}) =>
      this.request<CampaignDTO, any>({
        path: `/api/public/campaigns/${publicId}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Сегмент — тематика объявления. Ставка и бюджет против других запущенных объявлений тематики: медианы, на сколько процентов выше или ниже и у какой доли объявлений меньше. Пока других объявлений меньше трёх, сравнения нет — только средняя рыночная ставка по тематике
     *
     * @tags PublicBoard
     * @name BoardCampaignSegment
     * @summary Объявление в своём сегменте
     * @request GET:/api/public/campaigns/{publicId}/segment
     */
    boardCampaignSegment: (publicId: string, params: RequestParams = {}) =>
      this.request<CampaignSegmentDTO, any>({
        path: `/api/public/campaigns/${publicId}/segment`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Короткие строки: кто, сколько, статус; открытые (PENDING, SENT) сверху
     *
     * @tags Finance
     * @name FinanceTopUps
     * @summary Заявки заказчиков на пополнение
     * @request GET:/api/finance/top-ups
     * @secure
     */
    financeTopUps: (params: RequestParams = {}) =>
      this.request<OperationRowDTO[], any>({
        path: `/api/finance/top-ups`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Короткие строки: кто, сколько, статус; открытые (PENDING, SENT) сверху
     *
     * @tags Finance
     * @name FinancePayouts
     * @summary Заявки креаторов на выплату
     * @request GET:/api/finance/payouts
     * @secure
     */
    financePayouts: (params: RequestParams = {}) =>
      this.request<OperationRowDTO[], any>({
        path: `/api/finance/payouts`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Одна таблица: пополнения, резервы, начисления креаторам и выводы; у каждой строки откуда → куда, сумма и статус. Фильтры необязательны; новые сверху
     *
     * @tags Finance
     * @name FinanceOperations
     * @summary Все операции по всем кошелькам
     * @request GET:/api/finance/operations
     * @secure
     */
    financeOperations: (
      query?: {
        /** @format int64 */
        userId?: number;
        type?:
          | "TOP_UP"
          | "WITHDRAWAL"
          | "ALLOCATION"
          | "RELEASE"
          | "EARNING"
          | "PAYOUT"
          | "REFERRAL_REWARD";
        status?:
          | "DONE"
          | "PENDING"
          | "SENT"
          | "CONFIRMED"
          | "REJECTED"
          | "CANCELLED"
          | "EXPIRED";
      },
      params: RequestParams = {},
    ) =>
      this.request<OperationRowDTO[], any>({
        path: `/api/finance/operations`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Любая проводка любого кошелька; для пополнения, вывода и выплаты — ещё перевод: адрес TRON, номер транзакции, скриншоты и комментарии
     *
     * @tags Finance
     * @name FinanceOperation
     * @summary Операция целиком
     * @request GET:/api/finance/operations/{publicId}
     * @secure
     */
    financeOperation: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/finance/operations/${publicId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Все заказчики с кошельком: свободный остаток, сумма бюджетов объявлений и начислено креаторам
     *
     * @tags Finance
     * @name FinanceCustomers
     * @summary Кошельки заказчиков
     * @request GET:/api/finance/customers
     * @secure
     */
    financeCustomers: (params: RequestParams = {}) =>
      this.request<WalletDTO[], any>({
        path: `/api/finance/customers`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 404 — учётки нет; 400 — у пользователя роль без кошелька
     *
     * @tags Finance
     * @name FinanceCustomer
     * @summary Кошелёк заказчика
     * @request GET:/api/finance/customers/{userId}
     * @secure
     */
    financeCustomer: (userId: number, params: RequestParams = {}) =>
      this.request<WalletDTO, any>({
        path: `/api/finance/customers/${userId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Доступно к выводу, зарезервировано в заявках, выведено, зачислено всего и сколько ещё ждёт зачисления
     *
     * @tags Earnings
     * @name MyEarnings
     * @summary Мой заработок
     * @request GET:/api/earnings
     * @secure
     */
    myEarnings: (params: RequestParams = {}) =>
      this.request<CreatorWalletDTO, any>({
        path: `/api/earnings`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Короткие строки: что за операция, сумма и статус; подробности — по publicId
     *
     * @tags Earnings
     * @name MyOperations
     * @summary Мои операции
     * @request GET:/api/earnings/operations
     * @secure
     */
    myOperations: (params: RequestParams = {}) =>
      this.request<OperationRowDTO[], any>({
        path: `/api/earnings/operations`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Проводка и, для вывода, заявка: адрес, скриншоты и комментарий финансиста, причина отказа
     *
     * @tags Earnings
     * @name MyOperation
     * @summary Операция целиком
     * @request GET:/api/earnings/operations/{publicId}
     * @secure
     */
    myOperation: (publicId: string, params: RequestParams = {}) =>
      this.request<OperationDetailDTO, any>({
        path: `/api/earnings/operations/${publicId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Креаторы, ссылки на ролики, просмотры и начисленные суммы; старые сверху
     *
     * @tags Campaign
     * @name CampaignApplications
     * @summary Отклики по объявлению
     * @request GET:/api/campaigns/{id}/applications
     * @secure
     */
    campaignApplications: (id: string, params: RequestParams = {}) =>
      this.request<ApplicationDTO[], any>({
        path: `/api/campaigns/${id}/applications`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Медианная ставка за 1000 просмотров и медианный бюджет по всем запущенным объявлениям, в копейках; пока таких объявлений нет — 150 ₽ и 100 000 ₽. Минимальный бюджет для запуска объявления, в копейках (настройка CAMPAIGN_MIN_BUDGET_RUB). Сколько процентов бюджета может составлять порог вывода (настройка CAMPAIGN_MAX_PAYOUT_BUDGET_PERCENT). Плюс до 10 самых популярных тематик со средней ставкой за 1000 просмотров по каждой
     *
     * @tags Campaign
     * @name CampaignBenchmarks
     * @summary Медианы ставки и бюджета, минимальный бюджет, тематики
     * @request GET:/api/campaigns/benchmarks
     * @secure
     */
    campaignBenchmarks: (params: RequestParams = {}) =>
      this.request<CampaignBenchmarkDTO, any>({
        path: `/api/campaigns/benchmarks`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Кто пришёл с токеном: id, логин, имя, роль и вкладки кабинета, доступные этой роли
     *
     * @tags Auth
     * @name Me
     * @summary Текущий пользователь
     * @request GET:/api/auth/me
     * @secure
     */
    me: (params: RequestParams = {}) =>
      this.request<CurrentUserDTO, any>({
        path: `/api/auth/me`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Замеры просмотров с таймстемпами, свежие сверху — по ним видно динамику ролика. Доступна креатору отклика, заказчику объявления и админу
     *
     * @tags Application
     * @name ViewHistory
     * @summary История просмотров ролика
     * @request GET:/api/applications/{id}/views/history
     * @secure
     */
    viewHistory: (id: string, params: RequestParams = {}) =>
      this.request<ViewSnapshotDTO[], any>({
        path: `/api/applications/${id}/views/history`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Отклики текущего креатора со ставкой объявления, просмотрами и начислением. Новые сверху
     *
     * @tags Application
     * @name MyApplications
     * @summary Мои отклики
     * @request GET:/api/applications/my
     * @secure
     */
    myApplications: (params: RequestParams = {}) =>
      this.request<ApplicationDTO[], any>({
        path: `/api/applications/my`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Отклики с приложенным роликом, по которым ещё нет решения. Старые сверху
     *
     * @tags AdminModeration
     * @name ModerationQueue
     * @summary Очередь модерации
     * @request GET:/api/admin/moderation/applications
     * @secure
     */
    moderationQueue: (params: RequestParams = {}) =>
      this.request<ApplicationDTO[], any>({
        path: `/api/admin/moderation/applications`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFraud
     * @name Creators
     * @summary Креаторы с репутацией
     * @request GET:/api/admin/fraud/creators
     * @secure
     */
    creators: (params: RequestParams = {}) =>
      this.request<CreatorTrustDTO[], any>({
        path: `/api/admin/fraud/creators`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description По умолчанию отклики со статусами SUSPICIOUS и FRAUD, самые подозрительные сверху. filter=all — все, filter=<статус> — один статус
     *
     * @tags AdminFraud
     * @name Applications
     * @summary Очередь подозрительных роликов
     * @request GET:/api/admin/fraud/applications
     * @secure
     */
    applications: (
      query?: {
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<FraudApplicationDTO[], any>({
        path: `/api/admin/fraud/applications`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFraud
     * @name Application
     * @summary Отклик с метриками и решением
     * @request GET:/api/admin/fraud/applications/{id}
     * @secure
     */
    application: (id: string, params: RequestParams = {}) =>
      this.request<FraudApplicationDTO, any>({
        path: `/api/admin/fraud/applications/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Studio
     * @name DeleteAsset
     * @summary Удалить файл из библиотеки
     * @request DELETE:/api/studio/assets/{id}
     * @secure
     */
    deleteAsset: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/studio/assets/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags SocialAccounts
     * @name Disconnect
     * @summary Отвязать аккаунт
     * @request DELETE:/api/social/accounts/{id}
     * @secure
     */
    disconnect: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/social/accounts/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Креатор убирает свой отклик или отказывается от взятой работы, пока заказчик не принял решение: после решения — 409
     *
     * @tags Application
     * @name DeleteApplication
     * @summary Отозвать отклик
     * @request DELETE:/api/applications/{id}
     * @secure
     */
    deleteApplication: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/applications/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Креатор продолжает без надбавки link или promo по меньшей ставке; база и другая надбавка остаются
     *
     * @tags Application
     * @name DeclinePlacement
     * @summary Отказаться от надбавки
     * @request DELETE:/api/applications/{id}/placements/{kind}
     * @secure
     */
    declinePlacement: (id: string, kind: string, params: RequestParams = {}) =>
      this.request<ApplicationDTO, any>({
        path: `/api/applications/${id}/placements/${kind}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
}
