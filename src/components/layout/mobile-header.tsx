'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotification?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export function MobileHeader({
  title = '포게더',
  showSearch = true,
  showNotification = true,
  onSearchClick,
  onNotificationClick,
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 왼쪽: 햄버거 메뉴 + 타이틀 */}
        <div className="flex items-center space-x-3">
          {/* 햄버거 메뉴 - 모바일에서만 표시 */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[400px]">
              <SheetTitle hidden>메뉴</SheetTitle>
              <SheetDescription hidden>
                주요 메뉴를 탐색할 수 있습니다.
              </SheetDescription>
              <nav className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">메뉴</h2>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" className="justify-start">
                    홈
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    로그인
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    회원가입
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    설정
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* 타이틀 */}
          <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center space-x-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">검색</span>
            </Button>
          )}

          {showNotification && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              {/* 알림 배지 (예시) */}
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
              <span className="sr-only">알림</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
