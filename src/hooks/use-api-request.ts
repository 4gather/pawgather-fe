'use client';

import { useCallback } from 'react';

import { useAuthStore } from '@/stores/auth-store';

/**
 * API 요청 시 토큰 만료를 자동으로 처리하는 훅
 */
export function useApiRequest() {
  const { accessToken, refreshTokens } = useAuthStore();

  const apiRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      // 첫 번째 요청 시도
      let response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('🔄 401 에러 감지, 토큰 갱신 시도');

        try {
          const errorData = await response.json();

          // INVALID_ACCESS_TOKEN인 경우 토큰 갱신 시도
          if (errorData.code === 'INVALID_ACCESS_TOKEN') {
            console.log('🔄 INVALID_ACCESS_TOKEN 에러, 토큰 갱신 시도');

            const refreshSuccess = await refreshTokens();

            if (refreshSuccess) {
              // 갱신된 토큰으로 재요청
              const newAccessToken = useAuthStore.getState().accessToken;
              response = await fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          } else {
            // 다른 401 에러들 (INVALID_BEARER, EXPIRED_TOKEN 등)도 토큰 갱신 시도
            console.log(`🔄 401 에러 (${errorData.code}), 토큰 갱신 시도`);

            const refreshSuccess = await refreshTokens();

            if (refreshSuccess) {
              const newAccessToken = useAuthStore.getState().accessToken;
              response = await fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }
        } catch {
          // JSON 파싱 실패 시 일반적인 토큰 갱신 시도
          console.log('🔄 401 에러 응답 파싱 실패, 일반 토큰 갱신 시도');

          const refreshSuccess = await refreshTokens();

          if (refreshSuccess) {
            const newAccessToken = useAuthStore.getState().accessToken;
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
              },
            });
          }
        }
      }
      // 404 에러 시 별도 처리 (토큰 갱신하지 않음)
      else if (response.status === 404) {
        console.log('🔴 404 에러 감지: 사용자 정보 없음 또는 리소스 없음');

        // 404는 토큰 갱신으로 해결되지 않는 문제이므로 바로 반환
        const errorData = await response.json().catch(() => ({}));

        // NOT_FOUND_USER인 경우 특별 처리
        if (errorData.code === 'NOT_FOUND_USER') {
          console.log('🔴 사용자 계정이 삭제되거나 비활성화됨');
          // authStore의 handleTokenRefreshError에서 처리하도록 위임
          const { handleTokenRefreshError } = useAuthStore.getState();
          handleTokenRefreshError({
            status: 404,
            code: 'NOT_FOUND_USER',
            message: errorData.message || '로그인을 진행해주세요.',
          });
        }
      }

      return response;
    },
    [accessToken, refreshTokens]
  );

  return { apiRequest };
}
