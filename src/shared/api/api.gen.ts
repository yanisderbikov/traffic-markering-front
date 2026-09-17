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
   * Telegram для связи с криаторами
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

/** Сохранение профиля криатора */
export interface CreatorProfileRequestDTO {
  /**
   * Как показывать криатора заказчику; пусто — имя из учётки
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

/** Профиль криатора */
export interface CreatorProfileDTO {
  /** @format uuid */
  id?: string;
  /**
   * ID пользователя-криатора
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
   * Заголовок объявления
   * @minLength 0
   * @maxLength 255
   * @example "Обзор приложения для доставки еды"
   */
  title: string;
  /** Что нужно снять: формат, хронометраж, требования */
  description: string;
  /**
   * Ключ загруженной фотографии из /api/files/campaign-photo/presign
   * @minLength 0
   * @maxLength 512
   */
  photoKey: string;
  /**
   * Ставка за 1000 просмотров, в копейках
   * @format int64
   * @example 35000
   */
  ratePerThousandKopecks: number;
  /**
   * Выделенный бюджет, в копейках
   * @format int64
   * @example 5000000
   */
  budgetKopecks: number;
  /**
   * Регион, по которому считаются оплачиваемые просмотры: RUSSIA, CIS или WORLDWIDE
   * @example "WORLDWIDE"
   */
  region: "RUSSIA" | "CIS" | "WORLDWIDE";
  /**
   * Статус; null — не менять (при создании DRAFT)
   * @example "ACTIVE"
   */
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
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
   * Уже начислено криаторам, в копейках
   * @format int64
   */
  spentKopecks?: number;
  /**
   * Остаток бюджета, в копейках
   * @format int64
   */
  remainingKopecks?: number;
  /** Статус: DRAFT, ACTIVE, PAUSED, COMPLETED */
  status?: string;
  /**
   * Человекочитаемый статус
   * @example "Активно"
   */
  statusDescription?: string;
  /** Регион, по которому считаются оплачиваемые просмотры: RUSSIA, CIS, WORLDWIDE */
  region?: string;
  /**
   * Человекочитаемый регион
   * @example "Только РФ"
   */
  regionDescription?: string;
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

/** Запрос на регистрацию */
export interface RegisterRequestDTO {
  /**
   * Логин (e-mail)
   * @minLength 1
   * @maxLength 255
   * @example "creator@traffic.ru"
   */
  username: string;
  /**
   * Пароль, минимум 6 символов
   * @minLength 6
   * @maxLength 2147483647
   */
  password: string;
  /**
   * Имя (как обращаться к человеку)
   * @minLength 1
   * @maxLength 255
   * @example "Аня"
   */
  name: string;
  /**
   * Роль: CUSTOMER (заказчик) или CREATOR (криатор)
   * @example "CREATOR"
   */
  role: "CUSTOMER" | "CREATOR" | "ADMIN" | "SERVICE";
}

/** Ответ с токеном */
export interface LoginResponseDTO {
  /** JWT токен */
  token?: string;
}

/** Запрос на вход */
export interface LoginRequestDTO {
  /**
   * Логин (e-mail)
   * @example "demo-creator@traffic.ru"
   */
  username: string;
  /** Пароль */
  password: string;
}

/** Отклик криатора на объявление */
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

/** Отклик криатора: и в списке заказчика, и в списке криатора */
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
  /** @format int64 */
  creatorId?: number;
  creatorName?: string;
  /** Telegram криатора из профиля; null — не заполнен */
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
   * Начислено криатору, в копейках
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
   * Уже начислено криаторам, в копейках
   * @format int64
   */
  spentKopecks?: number;
  /**
   * Остаток бюджета, в копейках
   * @format int64
   */
  remainingKopecks?: number;
  /** Регион, по которому считаются оплачиваемые просмотры: RUSSIA, CIS, WORLDWIDE */
  region?: string;
  /**
   * Человекочитаемый регион
   * @example "Только РФ"
   */
  regionDescription?: string;
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

/** Текущий пользователь */
export interface CurrentUserDTO {
  /** @format int64 */
  id?: number;
  /** Логин (e-mail) */
  username?: string;
  name?: string;
  /** Роль: CUSTOMER, CREATOR или ADMIN */
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
     * @description Профиль текущего криатора; если его почему-то нет — заводится пустой, а не 404
     *
     * @tags Profile
     * @name GetCreatorProfile
     * @summary Мой профиль криатора
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
     * @summary Сохранить профиль криатора
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
     * @description Полное обновление полей; смена ставки или бюджета пересчитывает начисления по откликам
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
     * @description Только пока по объявлению нет откликов, иначе 409: удаление стёрло бы историю начислений криаторам
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
     * @description Ставка и бюджет в копейках; статус можно не передавать — тогда объявление создаётся черновиком
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
     * @description Роль — CUSTOMER (заказчик) или CREATOR (криатор). Сразу заводится пустой профиль нужного типа, в ответе — токен: логиниться повторно не нужно. 409, если логин уже занят
     *
     * @tags Auth
     * @name Register
     * @summary Регистрация
     * @request POST:/api/auth/register
     */
    register: (data: RegisterRequestDTO, params: RequestParams = {}) =>
      this.request<LoginResponseDTO, any>({
        path: `/api/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 401 и одинаковый текст на неверный логин и на неверный пароль
     *
     * @tags Auth
     * @name Login
     * @summary Вход, получение токена
     * @request POST:/api/auth/login
     */
    login: (data: LoginRequestDTO, params: RequestParams = {}) =>
      this.request<LoginResponseDTO, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Криатор прикладывает ссылку на ролик. Откликнуться можно только на активное объявление, один раз и не на своё; повторный отклик — 409
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
     * @description На публичной доске показываются только объявления в статусе ACTIVE
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
     * @description Витрина криатора: отображаемое имя, «о себе» и соцсети — заказчик смотрит, кому отдаёт заказ
     *
     * @tags PublicBoard
     * @name PublicCreator
     * @summary Профиль криатора
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
     * @description Криаторы, ссылки на ролики, просмотры и начисленные суммы; старые сверху
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
     * @description Отклики текущего криатора со ставкой объявления, просмотрами и начислением. Новые сверху
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
     * @description Криатор убирает свой отклик, пока заказчик его не рассмотрел: после решения — 409
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
  };
}
