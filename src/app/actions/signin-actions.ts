'use server';

import { z } from 'zod';

import { loginSchema } from '@/lib/validations/schemas';

export type SigninState = {
  error?: string;
  success?: boolean;
  userData?: {
    userId: string;
    email: string;
    nickName: string;
    userImg?: string | null;
    provider?: string;
    accessToken?: string;
  };
} | null;

export async function signinAction(
  prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  try {
    // 입력 검증
    const validationResult = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validationResult.success) {
      const flattenErrors = z.flattenError(validationResult.error);
      const firstErrorMessage =
        flattenErrors.fieldErrors.email?.[0] ||
        flattenErrors.fieldErrors.password?.[0] ||
        '입력 정보를 확인해주세요.';

      return {
        error: firstErrorMessage,
      };
    }

    const { email, password } = validationResult.data;

    // 로그인 시도
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // 쿠키 포함
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || '로그인에 실패했습니다.',
      };
    }

    const userData = await response.json();
    return {
      success: true,
      userData: {
        userId: userData.userId || 'temp-user-id', // API 응답에 포함되지 않은 경우 임시값
        email: userData.email,
        nickName: userData.nickName,
        userImg: userData.userImg,
        provider: userData.provider,
        accessToken: userData.accessToken,
      },
    };
  } catch (error) {
    console.error('Signin action error:', error);
    return {
      error: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
    };
  }
}

export async function oauthSigninAction(
  prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  try {
    // FormData에서 provider 추출
    const provider = formData.get('provider') as 'google' | 'naver';

    if (!provider || !['google', 'naver'].includes(provider)) {
      return {
        error: '지원하지 않는 OAuth 제공자입니다.',
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/oauth/${provider}`,
      {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'OAuth 로그인에 실패했습니다.',
      };
    }

    const userData = await response.json();

    return {
      success: true,
      userData: {
        userId: userData.userId || `oauth-${provider}-user`, // provider별 임시 ID
        email: userData.email,
        nickName: userData.nickName || userData.nickname,
        userImg: userData.userImg,
        provider: userData.provider,
        accessToken: userData.accessToken,
      },
    };
  } catch (error) {
    console.error('OAuth signin action error:', error);
    return {
      error: 'OAuth 로그인 중 오류가 발생했습니다.',
    };
  }
}
