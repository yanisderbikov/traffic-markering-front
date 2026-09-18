const HOSTS = [
  { platform: 'YOUTUBE_SHORTS', domains: ['youtube.com', 'youtu.be'] },
  { platform: 'TIKTOK', domains: ['tiktok.com'] },
  { platform: 'INSTAGRAM', domains: ['instagram.com', 'instagr.am'] },
];

export const VIDEO_PLATFORMS = HOSTS.map(({ platform }) => platform);

const hostOf = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const detectPlatform = (url) => {
  const host = hostOf(url || '');
  if (!host) return null;
  const match = HOSTS.find(({ domains }) =>
    domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
  );
  return match ? match.platform : null;
};
