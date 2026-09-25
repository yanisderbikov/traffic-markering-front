// Формулы домашней страницы кабинета: числа в полосах состояния и строки
// «требует внимания». Чистые функции без React, чтобы их можно было проверить
// отдельно и не размазывать арифметику по JSX.
//
// Суммы считаются на клиенте по непагинированным массивам — ровно как на
// целевых страницах. Если эти эндпоинты получат пагинацию, домашней странице
// понадобится агрегирующий эндпоинт, иначе цифры станут «по первой странице».

/**
 * Русское склонение по числу: plural(3, ['операция', 'операции', 'операций']).
 * 1, 21, 31 → one; 2–4, 22–24 → few; 5–20, 25–30 и все 11–14 → many.
 */
export const plural = (n, [one, few, many]) => {
  const abs = Math.abs(Math.trunc(Number(n) || 0));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

// Бэк может вернуть не массив (например, страницу с ошибкой в 200) —
// тогда считаем как по пустому списку, как делают остальные страницы.
// Экспортируется: компонент проверяет им «список пуст» для пустых состояний.
export const asList = (rows) => (Array.isArray(rows) ? rows : []);

const sumBy = (rows, pick) => rows.reduce((sum, row) => sum + (Number(pick(row)) || 0), 0);

const countBy = (rows, match) => rows.filter(match).length;

// ---- Объявления (myCampaigns) ----

export const campaignStats = (rows) => {
  const list = asList(rows);
  return {
    active: countBy(list, (row) => row.status === 'ACTIVE'),
    applications: sumBy(list, (row) => row.applicationsCount),
    views: sumBy(list, (row) => row.totalViews),
  };
};

/** Активные объявления, у которых бюджет закончился — им нужна доплата или пауза. */
export const exhaustedCampaigns = (rows) =>
  countBy(asList(rows), (row) => row.status === 'ACTIVE' && (row.remainingKopecks ?? 0) <= 0);

// ---- Кошелёк заказчика (myWalletOperations) ----

/**
 * Операции, где ход за заказчиком: неоплаченные заявки на пополнение и выводы,
 * которые финансист отправил и ждёт подтверждения, — как на странице кошелька.
 */
export const awaitingWalletOperations = (rows) =>
  countBy(
    asList(rows),
    (row) =>
      (row.type === 'TOP_UP' && row.status === 'PENDING') ||
      (row.type === 'WITHDRAWAL' && row.status === 'SENT')
  );

// ---- Отклики креатора (myApplications) ----

export const applicationStats = (rows) => {
  const list = asList(rows);
  return {
    approved: countBy(list, (row) => row.status === 'APPROVED'),
    pending: countBy(list, (row) => row.status === 'PENDING'),
    // Просмотры считаем только по одобренным и завершённым: у отклонённых
    // и ожидающих их либо нет, либо они не оплачиваются.
    views: sumBy(
      list.filter((row) => row.status === 'APPROVED' || row.status === 'COMPLETED'),
      (row) => row.views
    ),
  };
};

// ---- Заработок креатора (myOperations) ----

/** Выплаты, которые финансист отправил и ждёт подтверждения креатора. */
export const awaitingPayoutConfirmations = (rows) =>
  countBy(asList(rows), (row) => row.status === 'SENT');

// ---- Выплаты (financePayouts) ----

export const payoutStats = (rows) => {
  const list = asList(rows);
  const open = list.filter((row) => row.status === 'PENDING' || row.status === 'SENT');
  return {
    open: open.length,
    // Суммы выплат в журнале отрицательные (деньги уходят), показываем модуль.
    openKopecks: sumBy(open, (row) => Math.abs(row.amountKopecks || 0)),
    paidKopecks: sumBy(
      list.filter((row) => row.status === 'CONFIRMED'),
      (row) => Math.abs(row.amountKopecks || 0)
    ),
  };
};

/** Заявки, которые финансисту ещё предстоит отправить — как pendingCount на странице выплат. */
export const pendingPayouts = (rows) => countBy(asList(rows), (row) => row.status === 'PENDING');

export const topUpsOnReview = (rows) => countBy(asList(rows), (row) => row.status === 'SENT');

// ---- Кошельки заказчиков (financeCustomers) ----

export const customerWalletStats = (rows) => {
  const list = asList(rows);
  return {
    customers: list.length,
    balanceKopecks: sumBy(list, (row) => row.balanceKopecks),
    allocatedKopecks: sumBy(list, (row) => row.allocatedKopecks),
  };
};
