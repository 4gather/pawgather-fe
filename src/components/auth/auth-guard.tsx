'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshTokens, setLoading } =
    useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      if (!isAuthenticated()) {
        // 토큰이 없으면 리프레시 시도
        const refreshSuccess = await refreshTokens();

        if (!refreshSuccess && requireAuth) {
          // 리프레시도 실패하고 인증이 필요한 페이지면 로그인으로 이동
          setLoading(false); // 리다이렉트 전 로딩 해제
          router.push('/signin');
          return;
        }
      }

      setIsInitialized(true);
      setLoading(false);
    };

    initializeAuth();
  }, [isAuthenticated, refreshTokens, requireAuth, router, setLoading]);

  // 로딩 중이거나 초기화되지 않았으면 로딩 표시
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p>인증 확인 중...</p>
          {requireAuth && (
            <p className="mt-2 text-sm text-gray-600">
              로그인이 필요한 페이지입니다.
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
