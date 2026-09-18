// Карта прав личного кабинета: роль → доступные секции.
// Должна совпадать с правилами в WebSecurityConfig на бэке.
export const SECTIONS = {
  CAMPAIGNS: 'CAMPAIGNS',
  WALLET: 'WALLET',
  APPLICATIONS: 'APPLICATIONS',
  EARNINGS: 'EARNINGS',
  PROFILE: 'PROFILE',
  SOCIALS: 'SOCIALS',
  FINANCE: 'FINANCE',
  USERS: 'USERS',
};

const ROLE_SECTIONS = {
  CUSTOMER: [SECTIONS.CAMPAIGNS, SECTIONS.WALLET, SECTIONS.PROFILE],
  CREATOR: [SECTIONS.APPLICATIONS, SECTIONS.EARNINGS, SECTIONS.PROFILE, SECTIONS.SOCIALS],
  FINANCE_MANAGER: [SECTIONS.FINANCE],
  ADMIN: [
    SECTIONS.CAMPAIGNS,
    SECTIONS.WALLET,
    SECTIONS.APPLICATIONS,
    SECTIONS.EARNINGS,
    SECTIONS.PROFILE,
    SECTIONS.SOCIALS,
  ],
  SUPER_ADMIN: [
    SECTIONS.CAMPAIGNS,
    SECTIONS.WALLET,
    SECTIONS.APPLICATIONS,
    SECTIONS.EARNINGS,
    SECTIONS.PROFILE,
    SECTIONS.SOCIALS,
    SECTIONS.FINANCE,
    SECTIONS.USERS,
  ],
};

export const getAllowedSections = (role) => ROLE_SECTIONS[role] || [];

// Какой секции принадлежит путь кабинета. null — общая страница (/app).
export const sectionForPath = (pathname) => {
  if (pathname.startsWith('/app/campaigns')) return SECTIONS.CAMPAIGNS;
  if (pathname.startsWith('/app/wallet')) return SECTIONS.WALLET;
  if (pathname.startsWith('/app/applications')) return SECTIONS.APPLICATIONS;
  if (pathname.startsWith('/app/earnings')) return SECTIONS.EARNINGS;
  if (pathname.startsWith('/app/finance')) return SECTIONS.FINANCE;
  if (pathname.startsWith('/app/admin')) return SECTIONS.USERS;
  if (pathname.startsWith('/app/profile/socials')) return SECTIONS.SOCIALS;
  if (pathname.startsWith('/app/profile')) return SECTIONS.PROFILE;
  return null;
};
