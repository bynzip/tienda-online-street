import React from 'react';
type IconProps = React.SVGProps<SVGSVGElement>;

export const FacebookIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 1.6 3.6 0 5.1L8 22l-4-4 1-1-1 1 4 4 12-12c1.7-1.5 1-4.7 0-6.2-.5-.8-1-1.3-1.6-1.8C17.3 2.7 15 2 13 2c-1.4 0-2.8.5-4 1.3" />
    <path d="M11 7c.8.9 1.4 2 1.4 3.2 0 1.2-.6 2.3-1.4 3.2" />
    <path d="M2 22 22 2" />
  </svg>
);

export const YoutubeIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 3.9 5 5 5h14c1.1 0 2.5 1 2.5 2v10c0 1-1.4 2-2.5 2H5c-1.1 0-2.5-1-2.5-2z" />
    <polygon points="9.5 12 15.5 8 15.5 16" />
  </svg>
);
