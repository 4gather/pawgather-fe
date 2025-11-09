'use client';

import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { logoutAction } from '@/app/actions/auth-actions';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { useAuthStore } from '@/stores/auth-store';

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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 하이드레이션 문제 해결을 위한 mounted 상태 추가
  const [mounted, setMounted] = useState(false);

  const [isPending, startTransition] = useTransition();

  // 인증 상태와 사용자 정보 가져오기
  const { isAuthenticated, user, logout } = useAuthStore();

  // 로그아웃 액션 상태 관리
  const [logoutState, logoutActionHandler, logoutPending] = useActionState(
    logoutAction,
    null
  );

  // 클라이언트에서만 마운트 이후에 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 버튼 클릭 핸들러
  const handleSigninClick = () => {
    router.push('/signin');
  };

  // 로그아웃 버튼 클릭 핸들러
  const handleLogoutClick = () => {
    startTransition(() => {
      const formData = new FormData(); // 빈 FormData 전달
      const accessToken = useAuthStore.getState().accessToken;

      if (accessToken) {
        formData.append('accessToken', accessToken);
      }

      logoutActionHandler(formData);
    });
  };

  // 로그아웃 성공 처리
  useEffect(() => {
    if (logoutState?.success) {
      // Zustand 스토어에서 사용자 정보 삭제
      logout();

      // 성공 메시지 표시
      toast.success('로그아웃되었습니다', {
        // description: '안전하게 로그아웃되었습니다.',
        duration: 3000,
      });

      // 메인 페이지로 리다이렉트
      router.push('/');
    }
  }, [logoutState, logout, router]);

  // 로그아웃 에러 처리
  useEffect(() => {
    if (logoutState?.error) {
      toast.error('로그아웃 실패', {
        description: logoutState.error,
        duration: 5000,
      });
    }
  }, [logoutState]);

  // 마운트되기 전까지는 로그인되지 않은 상태로 렌더링
  const isUserAuthenticated = mounted ? isAuthenticated() : false;

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
                    달력
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    목록
                  </Button>
                  {mounted && !isUserAuthenticated && (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/signin');
                        }}
                      >
                        로그인
                      </Button>
                      <Button variant="ghost" className="justify-start">
                        회원가입
                      </Button>
                    </>
                  )}
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

          {/* 로그인 상태에 따른 조건부 렌더링 */}
          {isUserAuthenticated ? (
            // 로그인된 상태: 로그아웃 버튼 + 닉네임
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutClick}
                disabled={logoutPending || isPending}
                className="flex h-9 items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>
                  {' '}
                  {/* 작은 화면에서는 텍스트 숨김 */}
                  {logoutPending || isPending ? '로그아웃 중...' : '로그아웃'}
                </span>
              </Button>
              <span className="text-foreground hidden text-sm font-bold md:inline">
                {user?.nickname}님
              </span>
            </div>
          ) : (
            // 로그인되지 않은 상태: 로그인 버튼만
            <Button
              variant="outline"
              size="sm"
              onClick={handleSigninClick}
              className="flex h-9 items-center space-x-1"
            >
              <User className="h-4 w-4" />
              <span>로그인</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
