export const OPERATOR = 'ИП / ООО «___»';
export const CONTACT_EMAIL = 'support@getoffer.now';
export const SITE_URL = 'https://getoffer.now';
export const UPDATED_AT = '24 сентября 2026';

export const PLATFORMS = [
  {
    name: 'YouTube',
    scopes: 'youtube.readonly',
    purpose:
      'читаем название канала, аватар, число подписчиков и статистику опубликованных роликов, чтобы засчитать просмотры по вашим публикациям',
  },
  {
    name: 'TikTok',
    scopes: 'user.info.basic, user.info.profile, user.info.stats, video.list',
    purpose:
      'читаем ник, аватар, число подписчиков и список ваших видео со счётчиком просмотров',
  },
  {
    name: 'Instagram',
    scopes: 'instagram_business_basic, instagram_business_manage_insights',
    purpose:
      'читаем ник, число подписчиков и статистику ваших публикаций, включая просмотры Reels',
  },
];
