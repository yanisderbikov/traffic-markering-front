// Карта прав личного кабинета: роль → доступные секции.
// Должна совпадать с правилами в WebSecurityConfig на бэке.
export const SECTIONS = {
  CAMPAIGNS: 'CAMPAIGNS',
  APPLICATIONS: 'APPLICATIONS',
  PROFILE: 'PROFILE',
  SOCIALS: 'SOCIALS',
  WALLET: 'WALLET',
  ADMIN_WALLETS: 'ADMIN_WALLETS',
};

const ROLE_SECTIONS = {
  CUSTOMER: [SECTIONS.CAMPAIGNS, SECTIONS.PROFILE, SECTIONS.WALLET],
  CREATOR: [SECTIONS.APPLICATIONS, SECTIONS.PROFILE, SECTIONS.SOCIALS, SECTIONS.WALLET],
  ADMIN: [
    SECTIONS.CAMPAIGNS,
    SECTIONS.APPLICATIONS,
    SECTIONS.PROFILE,
    SECTIONS.SOCIALS,
    SECTIONS.ADMIN_WALLETS,
  ],
};

export const getAllowedSections = (role) => ROLE_SECTIONS[role] || [];

// Какой секции принадлежит путь кабинета. null — общая страница (/app).
export const sectionForPath = (pathname) => {
  if (pathname.startsWith('/app/admin/wallets')) return SECTIONS.ADMIN_WALLETS;
  if (pathname.startsWith('/app/wallet')) return SECTIONS.WALLET;
  if (pathname.startsWith('/app/campaigns')) return SECTIONS.CAMPAIGNS;
  if (pathname.startsWith('/app/applications')) return SECTIONS.APPLICATIONS;
  if (pathname.startsWith('/app/profile/socials')) return SECTIONS.SOCIALS;
  if (pathname.startsWith('/app/profile')) return SECTIONS.PROFILE;
  return null;
};
