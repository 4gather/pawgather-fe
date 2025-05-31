import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: '포게더',
  description: '모바일 반응형 앱',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
