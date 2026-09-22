# offer — фронтенд

Веб-интерфейс платформы рекламных интеграций.

**Заказчик** публикует объявление: описание задачи, ставку за 1000 просмотров,
выделенный бюджет, порог вывода («вывод от 3 000 ₽» — с какой накопленной по объявлению
суммы креатор может забирать заработанное) и площадки, с которых принимает ролики
(YouTube Shorts, TikTok, Instagram — в редакторе есть «выбрать все» и «убрать все»).
Порог виден на карточке и странице объявления и в откликах креатора. **Креатор** берёт
объявление в работу — снимает ролик и прикрепляет на него ссылку; площадка
определяется по ссылке (`src/shared/video.js`), и ссылка с площадки не из списка
объявления не пройдёт ни на фронте, ни на бэке. По мере набора просмотров бюджет объявления
«съедается», и на карточке видна шкала: сколько выделено, сколько потрачено,
сколько осталось.

В редакторе объявления заказчик задаёт **требования к ролику** (все необязательны):
минимальную длину в секундах, порог оплачиваемых просмотров («оплата от 1 000
просмотров» — ролик с меньшим числом просмотров не оплачивается), лимит роликов от
одного креатора и период приёма откликов (даты по Москве, включительно; вне периода
объявление уходит с доски, а страница отклика закрыта). Требования видны на карточке
доски, на странице объявления и над формой отклика — до того, как креатор что-то
отправит (`src/shared/requirements.js`, `src/shared/dates.js`). Там же заказчик
прикладывает **материалы**: файлы (загружаются напрямую в хранилище, до 100 МБ) и
ссылки — бриф, баннеры, референсы; креатор открывает или скачивает их со страницы
объявления (`src/components/shared/MaterialList`).

Ещё в редакторе заказчик выбирает **регион просмотров** — «только РФ», «СНГ» или
«весь мир» (по умолчанию): бэк оплачивает только просмотры из выбранного региона,
при «весь мир» — все. Географию просмотров по ролику отдаёт только YouTube, и то лишь
если креатор подключил канал с доступом к аналитике; TikTok и Instagram её не отдают,
поэтому при регионе «только РФ» или «СНГ» ролики с них не оплачиваются вовсе. Редактор
предупреждает об этом заказчика, когда такие площадки выбраны вместе с регионом; креатор
видит регион в требованиях на карточке, на странице объявления и на форме отклика,
а форма отклика отдельно предупреждает, если ссылка ведёт на площадку без географии
или YouTube подключён без аналитики. В откликах у обеих сторон рядом с просмотрами
показано, сколько из них идёт в расчёт (`payableViews`), или «география недоступна»
(`src/shared/viewRegion.js`, `src/shared/requirements.js`).

Деньги заказчика лежат в **кошельке** (`/app/wallet`): пополняет его и выводит из него
менеджер финансов в своём кабинете (`/app/finance`) — в USDT (TRC-20), обязательно со
скриншотом перевода и номером транзакции (для вывода ещё адрес TRON заказчика). Такая
операция висит «ждёт подтверждения», пока заказчик не откроет её из истории кошелька и не
нажмёт «Подтвердить»; если перевод не сошёлся, финансист отклоняет её с причиной, и деньги
возвращаются. Заказчик распределяет свободный остаток между объявлениями — бюджет объявления
резервируется из кошелька, уменьшение возвращает разницу. Если на бэке задан
`TOP_UP_TRON_ADDRESS`, на странице кошелька заказчик видит адрес платформы для пополнения.
Супер-админ (почта задаётся на бэке через `SUPER_ADMIN_EMAIL`) раздаёт роли на странице
`/app/admin/users`.

Креатор видит заработок на `/app/earnings`: начисления за просмотры приходят в кошелёк
раз в сутки ночью — как только накопленное по объявлению дошло до его порога вывода
(до этого сумма висит в «ждёт зачисления»), — и как только в кошельке что-то есть,
появляется кнопка «Вывести» — сумма и адрес TRON (USDT TRC-20). Заявка уходит финансисту (`/app/finance/payouts`): тот переводит вручную,
прикладывает скриншоты и номер транзакции, а креатор на странице операции
подтверждает получение. Списки операций у всех сторон одинаковые: таблица «дата · операция · откуда → куда ·
сумма · статус», строка ведёт на страницу операции, которая грузится отдельным запросом.
Карточка операции (`TransferCard`) у пополнения, вывода и выплаты одна и та же: адрес TRON,
номер транзакции, скриншоты, история статусов.
У финансиста есть общая таблица по всем кошелькам (`/app/finance/operations`).

Все суммы в API — целые числа **в копейках**. В рубли они переводятся только на
экране (`src/shared/money.js`), чтобы не терять копейки на округлениях float.

## Стек

- React 18 + Vite 5
- react-router-dom 6 (BrowserRouter, SPA)
- axios через сгенерированный клиент `src/shared/api/api.gen.ts`
- jwt-decode — роль и имя достаём прямо из токена
- react-hot-toast — уведомления
- CSS-модули (`*.module.css`), без UI-библиотек
- pnpm

## Запуск

```bash
pnpm install
cp .env.example .env.development   # при необходимости поправить адрес бэка
pnpm dev
```

Дев-сервер поднимается на `http://localhost:3000` и слушает `0.0.0.0`
(доступен из докера и с телефона в той же сети).

Бэкенд по умолчанию ожидается на `http://localhost:8090` — см.
`/Users/user/IdeaProjects/traffic-markering-back`.

## Переменные окружения

| Переменная | Значение по умолчанию | Зачем |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8090` | Базовый адрес бэкенда |

Образец — в `.env.example`. Реальные `.env*` в `.gitignore`.
В продовой сборке значение зашивается в бандл на этапе `docker build`
(`--build-arg VITE_API_URL=...`), потому что Vite подставляет `import.meta.env`
во время сборки, а не в рантайме.

## Маршруты

| Путь | Экран | Кто видит |
|---|---|---|
| `/` | `Board` — публичная доска объявлений | все |
| `/campaigns/:publicId` | `CampaignPage` — карточка объявления и форма отклика | все |
| `/login` | `Login` | все |
| `/register` | `Register` | все |
| `/app` | `AppHome` — приветствие и быстрые ссылки | авторизованные |
| `/app/campaigns` | `CustomerCampaigns` — мои объявления | CUSTOMER, ADMIN |
| `/app/campaigns/:campaignId` | `CampaignEditor` (`new` — создание, uuid — правка + отклики) | CUSTOMER, ADMIN |
| `/app/wallet` | `CustomerWallet` — кошелёк: свободно, в объявлениях, список операций | CUSTOMER, ADMIN |
| `/app/wallet/:operationId` | `OperationPage` — операция целиком; подтвердить пополнение или вывод | CUSTOMER, ADMIN |
| `/app/applications` | `CreatorApplications` — мои отклики | CREATOR, ADMIN |
| `/app/earnings` | `CreatorEarnings` — заработок, заявка на вывод, список операций | CREATOR, ADMIN |
| `/app/earnings/:operationId` | `OperationPage` — операция целиком; подтвердить получение или отменить заявку | CREATOR, ADMIN |
| `/app/finance` | `FinanceCustomers` — кошельки всех заказчиков с поиском | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/finance/:userId` | `FinanceCustomer` — кошелёк заказчика; пополнение и вывод со скриншотами и номером транзакции, операции | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/finance/payouts` | `FinancePayouts` — заявки креаторов на выплату с фильтром по статусу | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/finance/payouts/:payoutId` | `FinancePayout` — заявка целиком: адрес TRON, номер транзакции, скриншоты, «Отправлено» / «Отклонить» | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/finance/operations` | `FinanceOperations` — одна таблица по всем кошелькам с фильтрами по типу и статусу | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/finance/operations/:operationId` | `OperationPage` — любая операция целиком; отклонить пополнение или вывод, пока заказчик не подтвердил | FINANCE_MANAGER, SUPER_ADMIN |
| `/app/admin/users` | `AdminUsers` — все учётки, назначение ролей по почте | SUPER_ADMIN |
| `/app/profile` | `Profile` — профиль по роли | авторизованные |
| `*` | `NotFound` | — |

Всё под `/app` завёрнуто в `AppLayout`: он проверяет живой токен
(`apiClient.hasLiveToken()`), а доступ к разделу — по карте ролей из
`src/permissions.js`. Эта карта должна совпадать с матчерами `WebSecurityConfig`
на бэке: расхождение даст либо 403 на экране, либо пункт меню, ведущий в ошибку.

Роли в JWT: `CUSTOMER`, `CREATOR`, `FINANCE_MANAGER`, `ADMIN`, `SUPER_ADMIN`.
`ADMIN` видит секции заказчика и креатора, `SUPER_ADMIN` — их же плюс финансы и
пользователей. Русские подписи к ролям — `ROLE_LABELS` в `src/shared/dictionaries.js`.

## Авторизация

Вход по коду с почты, паролей нет. `Login`: почта → `requestCode` → поле кода →
`verify` → токен. `Register`: роль → имя и Telegram → почта (`register` заводит
учётку и шлёт код) → код → `verify` → токен. Повторно запросить код можно раз
в 30 секунд (`src/shared/useCooldown.js`), общая логика обмена кода на токен —
в `src/shared/auth.js`.

JWT лежит в `localStorage` под ключом `jwt_authentication`. Токен подставляется
в заголовок `Authorization: Bearer ...` через `securityWorker` клиента API.
Response-интерцептор в `src/apiClient.jsx` при 401/403 в зоне `/app` и протухшем
токене уводит на `/login?from=...`; валидный токен без нужной роли на логин не
бросает — иначе получилась бы петля.

## API-клиент

`src/shared/api/api.gen.ts` — клиент в формате `swagger-typescript-api`.
В отличие от anyforms он **закоммичен в репозиторий**, чтобы проект собирался
сразу после клона и в Docker не требовался живой бэкенд.

Перегенерировать с работающего бэка:

```bash
pnpm run dev-api      # с http://localhost:8090
VITE_API_URL=https://api.example.ru pnpm run api
```

После генерации сверьте имена методов: страницы зовут их напрямую
(`apiClient.api.boardCampaigns()`, `apiClient.api.myCampaigns()` и т.д.),
и переименование ручки на бэке сломает вызовы.

### Какой метод в какую ручку ходит

Имена методов springdoc берёт из имён методов контроллеров, поэтому таблица —
это же и карта бэкенда. `secure` = запрос уходит с `Authorization: Bearer`.

| Метод клиента | HTTP | Путь | Токен |
|---|---|---|---|
| `register(data)` | POST | `/api/auth/register` | — |
| `requestCode(data)` | POST | `/api/auth/request-code` | — |
| `verify(data)` | POST | `/api/auth/verify` | — |
| `me()` | GET | `/api/auth/me` | secure |
| `boardCampaigns()` | GET | `/api/public/campaigns` | — |
| `boardCampaign(publicId)` | GET | `/api/public/campaigns/{publicId}` | — |
| `publicCreator(userId)` | GET | `/api/public/creators/{userId}` | — |
| `myCampaigns()` | GET | `/api/campaigns` | secure |
| `createCampaign(data)` | POST | `/api/campaigns` | secure |
| `getCampaign(id)` | GET | `/api/campaigns/{id}` | secure |
| `updateCampaign(id, data)` | PUT | `/api/campaigns/{id}` | secure |
| `updateCampaignStatus(id, data)` | PATCH | `/api/campaigns/{id}/status` | secure |
| `deleteCampaign(id)` | DELETE | `/api/campaigns/{id}` | secure |
| `campaignApplications(id)` | GET | `/api/campaigns/{id}/applications` | secure |
| `apply(data)` | POST | `/api/applications` | secure |
| `myApplications()` | GET | `/api/applications/my` | secure |
| `updateApplicationStatus(id, data)` | PATCH | `/api/applications/{id}/status` | secure |
| `deleteApplication(id)` | DELETE | `/api/applications/{id}` | secure |
| `getCreatorProfile()` | GET | `/api/profile/creator` | secure |
| `updateCreatorProfile(data)` | PUT | `/api/profile/creator` | secure |
| `getCustomerProfile()` | GET | `/api/profile/customer` | secure |
| `updateCustomerProfile(data)` | PUT | `/api/profile/customer` | secure |
| `myWallet()` | GET | `/api/wallet` | secure |
| `myWalletOperations()` | GET | `/api/wallet/operations` | secure |
| `myWalletOperation(id)` | GET | `/api/wallet/operations/{id}` | secure |
| `financeCustomers()` | GET | `/api/finance/customers` | secure |
| `financeCustomer(userId)` | GET | `/api/finance/customers/{userId}` | secure |
| `financeOperations(query?)` | GET | `/api/finance/operations` | secure |
| `financeOperation(id)` | GET | `/api/finance/operations/{id}` | secure |
| `topUpWallet(userId, data)` | POST | `/api/finance/customers/{userId}/top-up` | secure |
| `withdrawFromWallet(userId, data)` | POST | `/api/finance/customers/{userId}/withdrawal` | secure |
| `myEarnings()` | GET | `/api/earnings` | secure |
| `myOperations()` | GET | `/api/earnings/operations` | secure |
| `myOperation(id)` | GET | `/api/earnings/operations/{id}` | secure |
| `requestPayout(data)` | POST | `/api/earnings/payouts` | secure |
| `confirmPayout(id)` | POST | `/api/earnings/payouts/{id}/confirm` | secure |
| `cancelPayout(id)` | POST | `/api/earnings/payouts/{id}/cancel` | secure |
| `financePayouts()` | GET | `/api/finance/payouts` | secure |
| `markPayoutSent(id, data)` | POST | `/api/finance/payouts/{id}/sent` | secure |
| `rejectPayout(id, data)` | POST | `/api/finance/payouts/{id}/reject` | secure |
| `presignPayoutProof(data)` | POST | `/api/files/payout-proof/presign` | secure |
| `updateViews(id, data)` | PATCH | `/api/tech/applications/{id}/views` | secure |

`updateViews` генератор кладёт в клиент вместе с остальными ручками из схемы, но из
браузера её никто не зовёт: она закрыта ролью `SERVICE` и предназначена внешнему
анализатору просмотров.

Ручки супер-админа (`GET`/`POST /api/superadmin/users`) на бэке помечены `@Hidden` и
в схему не попадают, поэтому `AdminUsers` зовёт их напрямую через `apiClient.instance`
— токен подставляет request-интерцептор.

Все суммы в запросах и ответах — `Long` в копейках, все даты — строки ISO-8601.

## Структура

```
src/
  index.jsx              точка входа: BrowserRouter + Toaster
  index.css              reset, фирменный шрифт Vasted (fallback Unbounded/Manrope) и CSS-переменные брендбука
  App.jsx                маршруты, нормализация пути, title/description/robots
  apiClient.jsx          axios-клиент, JWT, интерцепторы
  config.jsx             адрес бэкенда
  permissions.js         роль → доступные секции кабинета
  shared/
    api/api.gen.ts       сгенерированный клиент и типы DTO
    money.js             копейки ↔ рубли, форматирование просмотров
    dictionaries.js      русские подписи к enum'ам, даты, authHeaders
    viewRegion.js        регион просмотров: список, подписи, какие площадки отдают географию, тексты предупреждений
  components/            экраны, у каждого свой *.module.css
    shared/WalletSummary       три числа кошелька: свободно / в объявлениях / начислено
    shared/OperationRows       таблица операций: дата, тип, откуда → куда, сумма, статус — строка ведёт на детали
    shared/PayoutCard          карточка операции/заявки: адрес TRON, скриншоты, история статусов
```

### CSS-переменные

Объявлены в `:root` в `src/index.css` и используются модулями:

`--color-ink`, `--color-ink-soft`, `--color-muted`, `--color-page`,
`--color-surface`, `--color-border`, `--color-field-border`, `--color-track`,
`--color-danger`, `--color-success`, `--card-radius`, `--field-radius`,
`--pill-radius`, `--card-shadow`, `--focus-ring`, `--page-max-width`.

## Визуальный язык

- фон страницы `#e5e5e5`, карточки белые, радиус `22px`,
  тень `0 10px 24px rgba(0, 0, 0, 0.08)`, рамка `1px solid rgba(17, 17, 17, 0.08)`
- заголовки — `font-weight: 800`, строчными (`text-transform: lowercase`)
- инпуты — радиус `14px`, в фокусе чёрная рамка и мягкое кольцо
- основная кнопка — чёрная «таблетка», вторичная — контурная, опасная — `#b3261e`
- контейнер страницы — `max-width: 1100px`, на десктопе поля по 50px
- сетка карточек — `repeat(auto-fill, minmax(min(300px, 100%), 1fr))`

## Адаптивность

Отдельной мобильной вёрстки нет — сетки резиновые, и на телефоне они схлопываются
в одну колонку сами. `min(300px, 100%)` в `minmax` обязателен: без него на экранах
уже 324px колонка в 300px не влезает в контейнер с полями по 12px и вся страница
уезжает в горизонтальный скролл.

Отдельные брейкпоинты нужны только там, где резины не хватает:

| Брейкпоинт | Где | Что делает |
|---|---|---|
| `min-width: 769px` | все страницы | поля контейнера 12px → 50px |
| `max-width: 768px` | `index.css` | `font-size: 16px` у полей ввода — iOS Safari иначе зумит страницу при фокусе |
| `max-width: 900px` | `AppLayout` | сайдбар прячется, вместо него бургер и drawer |
| `max-width: 900px` | `CampaignPage` | две колонки (описание + блок отклика) → одна |
| `max-width: 600px` | `Board` | шапка доски из строки в столбец |
| `max-width: 520px` | `AppLayout` | шапка ужимается под самые узкие экраны |

## Сборка и деплой

```bash
pnpm build      # dist/
pnpm preview
```

`Dockerfile` собирает бандл в `node:20-alpine` и отдаёт его nginx'ом
(`nginx.conf` разворачивает любой путь в `index.html` — это SPA).
`pnpm-lock.yaml` лежит в репозитории, поэтому образ ставит зависимости с
`--frozen-lockfile` — версии в сборке ровно те же, что и локально.

`.github/workflows/deploy.yml` на пуш в `main` собирает образ и пушит в
`ghcr.io/yanisderbikov/traffic-markering-front` (теги `latest` и короткий sha).
Адрес бэка берётся из переменной репозитория `VITE_API_URL`.

## Демо-логины

Бэкенд на чистой базе накатывает демо-данные (миграция `V2__seed_demo.sql`):

| Логин | Роль |
|---|---|
| `demo-customer@traffic.ru` | заказчик |
| `demo-creator@traffic.ru` | креатор |

Почтовых ящиков у них нет: код входа берётся из лога бэка, который на локали
без `EMAIL_NOTISEND_API_KEY` печатает письмо вместо отправки.
