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
   * Telegram для связи
   * @minLength 0
   * @maxLength 255
   * @example "@anya"
   */
  telegram?: string;
  /**
   * Ссылка или ник в Instagram
   * @minLength 0
   * @maxLength 255
   */
  instagram?: string;
  /**
   * Ссылка или ник в TikTok
   * @minLength 0
   * @maxLength 255
   */
  tiktok?: string;
  /**
   * Ссылка на канал YouTube Shorts
   * @minLength 0
   * @maxLength 255
   */
  youtubeShorts?: string;
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

/** Создание/обновление объявления */
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
   * Регион, просмотры из которого оплачиваются: RUSSIA (только РФ), CIS (СНГ), WORLD (весь мир); null — весь мир
   * @example "RUSSIA"
   */
  viewRegion?: "RUSSIA" | "CIS" | "WORLD";
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

/** Медианы по запущенным объявлениям площадки; пока объявлений нет — базовые значения */
export interface CampaignBenchmarkDTO {
  /**
   * Медианная ставка за 1000 просмотров, в копейках
   * @format int64
   * @example 15000
   */
  medianRatePerThousandKopecks: number;
  /**
   * Медианный бюджет объявления, в копейках
   * @format int64
   * @example 10000000
   */
  medianBudgetKopecks: number;
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
  /** Регион оплачиваемых просмотров: RUSSIA, CIS, WORLD */
  viewRegion?: string;
  /**
   * Человекочитаемый регион просмотров
   * @example "весь мир"
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
  role: "CUSTOMER" | "CREATOR" | "ADMIN" | "SERVICE";
}

/** Запрос кода входа на почту */
export interface RequestCodeDTO {
  /**
   * Почта, на которую придёт код
   * @example "demo-creator@traffic.ru"
   */
  email: string;
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

/** Отклик креатора на объявление */
export interface ApplicationCreateRequestDTO {
  /**
   * ID объявления
   * @format uuid
   */
  campaignId: string;
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
  campaignTitle?: string;
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
  /** Регион оплачиваемых просмотров объявления: RUSSIA, CIS, WORLD */
  campaignViewRegion?: string;
  /**
   * Человекочитаемый регион просмотров объявления
   * @example "весь мир"
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
  /** Статус: PENDING, APPROVED, REJECTED, COMPLETED */
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
   * Просмотры из региона объявления, которые идут в расчёт начислений
   * @format int64
   */
  payableViews?: number;
  /** Известна ли география просмотров; false — площадка её не отдаёт, и по региону уже РФ/СНГ просмотры не оплачиваются */
  viewsGeographyKnown?: boolean;
  /**
   * Начислено креатору, в копейках
   * @format int64
   */
  accruedKopecks?: number;
  /** Когда просмотры обновлялись в последний раз, ISO-8601 */
  viewsSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Просмотры ролика от внешнего анализатора */
export interface ViewsUpdateRequestDTO {
  /**
   * Накопленное число просмотров ролика
   * @format int64
   * @example 12400
   */
  views: number;
  /**
   * Просмотры по странам (ISO 3166-1 alpha-2); null — география неизвестна
   * @example {"RU":9000,"KZ":1200}
   */
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

/** Решение заказчика по отклику */
export interface ApplicationStatusUpdateRequestDTO {
  /**
   * Новый статус: APPROVED, REJECTED или COMPLETED
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
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
  /** Регион оплачиваемых просмотров: RUSSIA, CIS, WORLD */
  viewRegion?: string;
  /**
   * Человекочитаемый регион просмотров
   * @example "весь мир"
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
  updatedAt?: string;
}

/** Операция по кошельку; сумма со знаком относительно свободных средств */
export interface WalletTransactionDTO {
  /**
   * Публичный номер операции для ссылок
   * @example "K7Q2M9XA"
   */
  publicId?: string;
  /** Тип: TOP_UP, WITHDRAWAL, ALLOCATION, RELEASE */
  type?: string;
  /**
   * Человекочитаемый тип
   * @example "Пополнение"
   */
  typeDescription?: string;
  /**
   * Сумма в копейках: плюс — деньги пришли в свободный остаток, минус — ушли
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
  /** Откуда ушли деньги */
  source?: FlowPointDTO;
  /** Куда пришли деньги */
  destination?: FlowPointDTO;
  /**
   * Объявление, если операция про него; null — объявление удалено или операция общая
   * @format uuid
   */
  campaignId?: string;
  campaignTitle?: string;
  campaignPublicId?: string;
  /** Кто провёл операцию; null — учётка удалена */
  actorName?: string;
  comment?: string;
  createdAt?: string;
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
   * @minItems 1
   */
  proofKeys: string[];
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
   * @minItems 1
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

/** Одна сторона движения денег: откуда они ушли или куда пришли */
export interface FlowPointDTO {
  /** EXTERNAL, CUSTOMER_WALLET, CAMPAIGN, CREATOR_WALLET или TRON */
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

/** Строка списка операций: суть, откуда → куда и статус; подробности — отдельной ручкой по publicId */
export interface OperationRowDTO {
  /**
   * Публичный номер операции для ссылок
   * @example "K7Q2M9XA"
   */
  publicId?: string;
  /** Тип: TOP_UP, WITHDRAWAL, ALLOCATION, RELEASE, EARNING, PAYOUT */
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
  /** Откуда ушли деньги */
  source?: FlowPointDTO;
  /** Куда пришли деньги */
  destination?: FlowPointDTO;
  createdAt?: string;
}

export interface ProofDTO {
  key?: string;
  url?: string;
}

/** Перевод вне платформы по операции: адрес TRON, номер транзакции, скриншоты, кто и когда */
export interface TransferDTO {
  /** Адрес кошелька TRON, куда ушли USDT; null для пополнения */
  tronAddress?: string;
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
}

/** Операция целиком: сама проводка и, если деньги ходили вне платформы, перевод со скриншотами и подтверждениями */
export interface OperationDetailDTO {
  transaction?: WalletTransactionDTO;
  /** Перевод вне платформы; null для внутренних операций и старых пополнений без документов */
  transfer?: TransferDTO;
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
  updatedAt?: string;
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
   * @minItems 1
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

/** Текущий пользователь */
export interface CurrentUserDTO {
  /** @format int64 */
  id?: number;
  /** Логин (e-mail) */
  username?: string;
  name?: string;
  /** Роль: CUSTOMER, CREATOR, FINANCE_MANAGER, ADMIN или SUPER_ADMIN */
  role?: string;
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
     * @description Медианная ставка за 1000 просмотров и медианный бюджет по всем запущенным объявлениям, в копейках; пока таких объявлений нет — 150 ₽ и 100 000 ₽
     *
     * @tags Campaign
     * @name CampaignBenchmarks
     * @summary Медианы ставки и бюджета
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
     * @description Ставка и бюджет в копейках; статус можно не передавать — тогда объявление создаётся черновиком; второй незаконченный черновик создать нельзя — 409
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
     * @description Креатор прикладывает ссылку на ролик. Откликнуться можно только на активное объявление, один раз и не на своё; повторный отклик — 409
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
     * @description Заказчик объявления одобряет (APPROVED), отклоняет (REJECTED) или завершает (COMPLETED) отклик. После смены статуса начисления по объявлению пересчитываются целиком
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
     * @description Кто пришёл с токеном: id, логин, имя и роль
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
     * @description Креатор убирает свой отклик, пока заказчик его не рассмотрел: после решения — 409
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
     * @description Доступно к выводу, зарезервировано в заявках, выведено, начислено всего; минимальная сумма вывода
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
     * @description Короткие строки: что за операция, сумма и статус; подробности — по id
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
     * @description Сумма резервируется сразу, заявка уходит финансисту в статусе PENDING; 400 — меньше минимума или адрес не TRC-20, 409 — не хватает доступных денег
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
     * @description Короткие строки: кто, сколько, статус; открытые (PENDING, SENT) сверху
     *
     * @tags Finance
     * @name FinancePayouts
     * @summary Заявки креаторов на вывод
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
     * @description Короткие строки: что за операция, откуда → куда, сумма и статус; подробности — по id
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
     * @description Проводка с объявлением, комментарием, кто провёл и остатком после; для пополнения и вывода — ещё перевод: адрес TRON, номер транзакции, скриншоты финансиста
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
          | "PAYOUT";
        status?:
          | "DONE"
          | "PENDING"
          | "SENT"
          | "CONFIRMED"
          | "REJECTED"
          | "CANCELLED";
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
     * @description Любая проводка любого кошелька; для вывода — ещё адрес TRON, скриншоты и комментарии
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
  };
}
