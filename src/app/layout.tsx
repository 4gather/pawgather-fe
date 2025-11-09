'use client';

import './globals.css';

import { Inter } from 'next/font/google';
import React from 'react';

import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from '@/shared/components/ui/sonner';
import { cn } from '@/shared/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: 헤더 액션 핸들러들
  const handleSearch = () => {
    console.log('검색 클릭');
    // TODO: 검색 모달 열기 또는 검색 페이지로 이동
  };

  const handleNotification = () => {
    console.log('알림 클릭');
    // TODO: 알림 모달 열기 또는 알림 페이지로 이동
  };

  return (
    <html lang="ko" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>포게더</title>
        <meta name="description" content="모바일 반응형 앱" />
      </head>
      <body
        className={cn(
          inter.className,
          'bg-background h-full min-h-screen font-sans antialiased',
          'touch-manipulation overflow-x-hidden',
          'text-sm sm:text-base'
        )}
      >
        <div className="flex min-h-screen flex-col">
          {/* 헤더 컴포넌트 */}
          <MobileHeader
            title="포게더"
            showSearch={true}
            showNotification={true}
            onSearchClick={handleSearch}
            onNotificationClick={handleNotification}
          />

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* 하단 네비게이션 컴포넌트 */}
          <BottomNavigation />
        </div>

        {/* 모바일 최적화된 Toast 설정 */}
        <Toaster
          position="top-center"
          richColors
          closeButton
          expand
          visibleToasts={3}
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '15px',
              padding: '16px',
              minWidth: '300px',
              maxWidth: '90vw', // 모바일에서 화면 넘치지 않게
            },
            className: 'shadow-xl',
            classNames: {
              success: 'bg-green-50 border-green-200 text-green-800',
              error: 'bg-red-50 border-red-200 text-red-800',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
              info: 'bg-blue-50 border-blue-200 text-blue-800',
            },
            duration: 5000, // 5초
          }}
        />
      </body>
    </html>
  );
}
