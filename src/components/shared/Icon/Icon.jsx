import React from 'react';

const PATHS = {
  grid: 'M3 3H10V10H3ZM14 3H21V10H14ZM3 14H10V21H3ZM14 14H21V21H14Z',
  briefcase: 'M8 6V3H16V6M3 7H21V20H3ZM3 12Q12 17 21 12',
  chart: 'M4 20V12M11 20V7M18 20V3',
  wallet: 'M3 6H20V21H3ZM3 6V3H18V6M15 12H22V17H15Z',
  users: 'M9 11A4 4 0 1 0 9 3A4 4 0 1 0 9 11ZM2 21C2 17 5 15 9 15S16 17 16 21M17 4A3 3 0 0 1 17 10M22 21C22 18 20 16 17 15.5',
  user: 'M12 12A4 4 0 1 0 12 4A4 4 0 1 0 12 12ZM4 21C4 17 7.5 15 12 15S20 17 20 21',
  shield: 'M12 3L4 6V11C4 16 7.5 20 12 21C16.5 20 20 16 20 11V6ZM9 12L11 14L15 10',
  link: 'M10 14L14 10M8 16L6.5 17.5A3.5 3.5 0 0 1 1.5 12.5L5 9A3.5 3.5 0 0 1 10 9M16 8L17.5 6.5A3.5 3.5 0 0 1 22.5 11.5L19 15A3.5 3.5 0 0 1 14 15',
  logout: 'M10 4H5V20H10M15 8L20 12L15 16M20 12H9',
  search: 'M10 3A7 7 0 1 0 10 17A7 7 0 1 0 10 3M15 15L22 22',
  bell: 'M5 17H19L17 13V8A5 5 0 0 0 7 8V13ZM10 21H14',
  menu: 'M3 6H21M3 12H21M3 18H21',
  close: 'M5 5L19 19M19 5L5 19',
  check: 'M4 12L9 17L20 6',
  plus: 'M12 5V19M5 12H19',
  arrowRight: 'M5 12H19M13 6L19 12L13 18',
  arrowLeft: 'M19 12H5M11 6L5 12L11 18',
  chevronRight: 'M9 5L16 12L9 19',
  chevronDown: 'M5 9L12 16L19 9',
  refresh: 'M20 12A8 8 0 1 1 17.5 6.2M20 4V9H15',
  copy: 'M8 8H20V20H8ZM4 16V4H16',
  download: 'M12 3V15M6 10L12 16L18 10M4 20H20',
  file: 'M6 3H14L19 8V21H6ZM14 3V8H19',
  external: 'M14 4H20V10M20 4L10 14M18 14V20H4V6H10',
  info: 'M12 21A9 9 0 1 0 12 3A9 9 0 1 0 12 21ZM12 11V16M12 8V8.5',
  trash: 'M4 7H20M9 7V4H15V7M6 7L7 21H17L18 7M10 11V17M14 11V17',
  eye: 'M2 12C5 6 9 4 12 4S19 6 22 12C19 18 15 20 12 20S5 18 2 12ZM12 15A3 3 0 1 0 12 9A3 3 0 1 0 12 15Z',
  play: 'M6 4L20 12L6 20Z',
  clock: 'M12 21A9 9 0 1 0 12 3A9 9 0 1 0 12 21ZM12 7V12L15 14',
  ticket: 'M3 8V6H21V8A2 2 0 0 0 21 12V14H3V12A2 2 0 0 0 3 8ZM3 14V18H21V14M15 6V18',
};

const Icon = ({ name, size = 20, className = '', strokeWidth = 1.7 }) => {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
};

export default Icon;
