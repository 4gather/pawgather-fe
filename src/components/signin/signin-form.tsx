'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { oauthSigninAction, signinAction } from '@/app/actions/signin-actions';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';

export function SigninForm() {
  const router = useRouter();

  const { login, setLoading } = useAuthStore();

  const [emailState, emailAction, emailPending] = useActionState(
    signinAction,
    null
  );
  const [googleState, googleAction, googlePending] = useActionState(
    oauthSigninAction,
    null
  );
  const [naverState, naverAction, naverPending] = useActionState(
    oauthSigninAction,
    null
  );

  // 전역 로딩 상태 동기화
  useEffect(() => {
    const isAnyLoading = emailPending || googlePending || naverPending;
    setLoading(isAnyLoading);
  }, [emailPending, googlePending, naverPending, setLoading]);

  // 이메일 로그인 성공 처리
  useEffect(() => {
    if (emailState?.success && emailState.userData) {
      const { userData } = emailState;

      login(
        {
          userId: userData.userId,
          email: userData.email || '',
          nickname: userData.nickName,
          userImg: userData.userImg,
          provider: userData.provider,
        },
        {
          accessToken: userData.accessToken || '',
          refreshToken: '',
        }
      );

      // 성공 메시지 표시
      toast.success('로그인되었습니다', {
        description: `${userData.nickName}님, 환영합니다!`,
        duration: 5000,
      });

      // 500ms 후 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [emailState, login, router]);

  // 구글 OAuth 로그인 성공 처리
  useEffect(() => {
    if (googleState?.success && googleState.userData) {
      const { userData } = googleState;

      login(
        {
          userId: userData.userId,
          email: userData.email || '',
          nickname: userData.nickName,
          userImg: userData.userImg,
          provider: userData.provider,
        },
        {
          accessToken: userData.accessToken || '',
          refreshToken: '',
        }
      );

      // OAuth 성공 메시지
      toast.success('구글 계정으로 로그인되었습니다', {
        description: `${userData.nickName}님, 환영합니다!`,
        duration: 5000,
      });

      // 500ms 후 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [googleState, login, router]);

  // 네이버 OAuth 로그인 성공 처리
  useEffect(() => {
    if (naverState?.success && naverState.userData) {
      const { userData } = naverState;

      login(
        {
          userId: userData.userId,
          email: userData.email || '',
          nickname: userData.nickName,
          userImg: userData.userImg,
          provider: userData.provider,
        },
        {
          accessToken: userData.accessToken || '',
          refreshToken: '',
        }
      );

      // OAuth 성공 메시지
      toast.success('네이버 계정으로 로그인되었습니다', {
        description: `${userData.nickName}님, 환영합니다!`,
        duration: 5000,
      });

      // 500ms 후 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [naverState, login, router]);

  return (
    <div className="w-full max-w-md space-y-6">
      {/* 로그인 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">로그인</h2>
      </div>

      {/* 이메일/비밀번호 로그인 */}
      <Card>
        <CardContent className="pt-6">
          <form action={emailAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {emailState?.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {emailState.error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={emailPending}>
              {emailPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">또는</span>
        </div>
      </div>

      {/* 간편 로그인 섹션 */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 text-center">
            <h3 className="font-semibold text-gray-900">간편 로그인</h3>
            <p className="mt-1 text-sm text-gray-500">
              소셜 계정으로 빠르게 로그인하세요
            </p>
          </div>

          <div className="space-y-3">
            {/* 구글 로그인 버튼 */}
            <form action={googleAction}>
              <input type="hidden" name="provider" value="google" />

              {googleState?.error && (
                <div className="mb-2 text-sm text-red-600">
                  {googleState.error}
                </div>
              )}

              <Button
                type="submit"
                variant="outline"
                className="flex h-12 w-full items-center justify-center gap-3"
                disabled={googlePending}
              >
                {googlePending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {googlePending ? '처리 중...' : '구글로 계속하기'}
              </Button>
            </form>

            {/* 네이버 로그인 버튼 */}
            <form action={naverAction}>
              <input type="hidden" name="provider" value="naver" />

              {naverState?.error && (
                <div className="mb-2 text-sm text-red-600">
                  {naverState.error}
                </div>
              )}

              <Button
                type="submit"
                variant="outline"
                className="flex h-12 w-full items-center justify-center gap-3 bg-[#03C75A] text-white hover:bg-[#02B351]"
                disabled={naverPending}
              >
                {naverPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
                  </svg>
                )}
                {naverPending ? '처리 중...' : '네이버로 계속하기'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* 회원가입 링크 */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <a
            href="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
