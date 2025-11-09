'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  userId: string;
  email: string;
  nickname: string;
  userImg?: string | null;
  provider?: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface TokenRefreshError {
  status: number;
  code: string;
  message: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  // Actions
  login: (userData: User, tokens: TokenData) => void;
  logout: () => void;
  updateTokens: (tokens: TokenData) => void;
  refreshTokens: () => Promise<boolean>;
  handleTokenRefreshError: (error: TokenRefreshError) => void;
  isAuthenticated: () => boolean;
  setLoading: (loading: boolean) => void;
}

// Zustand 스토어 생성
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      // 로그인 성공 시 사용자 정보와 토큰을 스토어에 저장
      login: (userData, tokens) => {
        set({
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isLoading: false,
        });
      },

      // 로그아웃 시 모든 상태 초기화 및 쿠키 삭제
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
        });

        // 브라우저 환경에서만 로컬스토리지 정리
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      // 토큰만 업데이트 (리프레시 시 사용)
      updateTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
        });
      },

      // 토큰 갱신 함수
      refreshTokens: async () => {
        try {
          const response = await fetch('/api/v1/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 쿠키 포함
          });

          if (response.ok) {
            const newTokens = await response.json();

            console.log('🔥 온디맨드 토큰 갱신 성공');

            // Zustand 상태 업데이트
            set({
              accessToken: newTokens.accessToken,
            });

            // localStorage 직접 업데이트 (persist 우회)
            if (typeof localStorage !== 'undefined') {
              try {
                const storageKey = 'auth-storage';
                const currentStorage = JSON.parse(
                  localStorage.getItem(storageKey) || '{}'
                );

                // 기존 구조 유지하면서 accessToken만 업데이트
                const updatedStorage = {
                  ...currentStorage,
                  state: {
                    ...currentStorage.state,
                    accessToken: newTokens.accessToken,
                  },
                };

                localStorage.setItem(
                  storageKey,
                  JSON.stringify(updatedStorage)
                );
              } catch (storageError) {
                console.error('localStorage 업데이트 실패:', storageError);
              }
            }

            return true;
          } else {
            // 에러 응답 처리
            const errorData = await response.json();
            get().handleTokenRefreshError({
              status: response.status,
              code: errorData.code,
              message: errorData.message,
            });
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // 네트워크 에러 처리
          get().handleTokenRefreshError({
            status: 500,
            code: 'NETWORK_ERROR',
            message: '네트워크 오류가 발생했습니다.',
          });
          return false;
        }
      },

      // 에러 코드별 분기 처리 함수 추가
      handleTokenRefreshError: (error: TokenRefreshError) => {
        console.log('🔥 토큰 갱신 에러 처리:', error);

        switch (error.code) {
          case 'INVALID_BEARER':
          case 'INVALID_PASSWORD':
            console.log('🔴 INVALID_BEARER: 다시 로그인 필요');
            // 플래시 메시지 표시
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '인증이 만료되었습니다',
                  description: '다시 로그인해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            get().logout();
            // 로그인 페이지로 리다이렉트
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            break;

          case 'INVALID_ACCESS_TOKEN':
            console.log('🔴 INVALID_ACCESS_TOKEN: 액세스 토큰 무효');
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '토큰이 유효하지 않습니다',
                  description: '다시 로그인해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            get().logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            break;

          case 'EXPIRED_VALIDITY_REFRESH_TOKEN':
            console.log(
              '🔴 EXPIRED_VALIDITY_REFRESH_TOKEN: 리프레시 토큰 만료'
            );
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'warning',
                  message: '세션이 만료되었습니다',
                  description: '보안을 위해 다시 로그인해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            get().logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            break;

          case 'NOT_FOUND_USER':
            console.log('🔴 NOT_FOUND_USER: 사용자 정보 없음');
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '사용자 정보를 찾을 수 없습니다',
                  description: '계정이 삭제되었거나 비활성화되었습니다.',
                })
              )}; path=/; max-age=5`;
            }
            get().logout();
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
            break;

          case 'VALIDATION_FAILED':
            console.log('🔴 VALIDATION_FAILED: 입력 검증 실패');
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '입력 정보를 확인해주세요',
                  description: error.message || '올바른 형식으로 입력해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            // 검증 실패는 로그아웃하지 않음
            break;

          case 'NETWORK_ERROR':
            console.log('🔴 NETWORK_ERROR: 네트워크 오류');
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '네트워크 오류',
                  description: '인터넷 연결을 확인해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            // 네트워크 에러는 로그아웃하지 않음
            break;

          default:
            console.log('🔴 UNKNOWN_ERROR: 알 수 없는 오류');
            if (typeof document !== 'undefined') {
              document.cookie = `flash-message=${encodeURIComponent(
                JSON.stringify({
                  type: 'error',
                  message: '알 수 없는 오류가 발생했습니다',
                  description: error.message || '잠시 후 다시 시도해주세요.',
                })
              )}; path=/; max-age=5`;
            }
            get().logout();
            break;
        }
      },

      // 인증 상태 확인
      isAuthenticated: () => {
        const { accessToken, user } = get();
        return !!(accessToken && user);
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // 로컬스토리지 키명
      storage: createJSONStorage(() => {
        // SSR 환경 대응 - localStorage가 없으면 더미 스토리지 반환
        if (typeof localStorage === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
