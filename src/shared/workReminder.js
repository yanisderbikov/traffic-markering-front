import { plural } from '../components/AppHome/homeStats';
import { formatDay } from './dates';

const DAY_MS = 24 * 60 * 60 * 1000;
const URGENT_DAYS_LEFT = 3;
const NUDGE_AFTER_DAYS = 3;

const DAYS = ['день', 'дня', 'дней'];

export const isAwaitingVideo = (application) => application?.status === 'IN_PROGRESS';

export const videoReminder = (application, now = new Date()) => {
  const endsAt = application.campaignEndsAt ? new Date(application.campaignEndsAt) : null;
  const takenAt = application.createdAt ? new Date(application.createdAt) : null;

  if (endsAt && endsAt < now) {
    return {
      tone: 'closed',
      text: 'Приём роликов по офферу закончился — прислать ссылку уже не получится.',
    };
  }

  const daysLeft = endsAt ? Math.ceil((endsAt - now) / DAY_MS) : null;
  if (daysLeft !== null && daysLeft <= URGENT_DAYS_LEFT) {
    return {
      tone: 'urgent',
      text: `До конца приёма роликов ${daysLeft} ${plural(daysLeft, DAYS)}. Пришлите ссылку, пока оффер открыт.`,
    };
  }

  const deadline = endsAt ? ` Приём роликов до ${formatDay(endsAt)}.` : '';
  const daysTaken = takenAt ? Math.floor((now - takenAt) / DAY_MS) : 0;
  if (daysTaken >= NUDGE_AFTER_DAYS) {
    return {
      tone: 'nudge',
      text: `Оффер в работе уже ${daysTaken} ${plural(daysTaken, DAYS)}. Ролик вышел? Пришлите ссылку — без неё просмотры не считаются.${deadline}`,
    };
  }

  return {
    tone: 'calm',
    text: `Снимите ролик по брифу, опубликуйте его в подключённом аккаунте и пришлите ссылку.${deadline}`,
  };
};
