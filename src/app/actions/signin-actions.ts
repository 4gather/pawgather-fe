'use server';

import { cookies } from 'next/headers';
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

    console.log('🟡 [Server] Login Response Status:', response.status);
    console.log(
      '🟡 [Server] Login Response Headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.error('🔴 [Server] Login failed with status:', response.status);

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      console.log('🟡 [Server] Response Content-Type:', contentType);

      let errorMessage = '로그인에 실패했습니다.';

      // JSON 응답인 경우에만 파싱
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('🔴 [Server] JSON 파싱 실패:', parseError);
        }
      } else {
        // HTML 또는 다른 형식의 응답인 경우
        const errorText = await response.text();
        console.error(
          '🔴 [Server] Non-JSON response:',
          errorText.substring(0, 200)
        );

        // ngrok 에러 체크
        if (errorText.includes('ERR_NGROK')) {
          errorMessage =
            '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.';
        } else if (response.status === 404) {
          errorMessage =
            'API 엔드포인트를 찾을 수 없습니다. URL을 확인해주세요.';
        }
      }

      return {
        error: errorMessage,
      };
    }

    // 백엔드에서 Set-Cookie 헤더 추출
    const setCookieHeaders = response.headers.getSetCookie();
    console.log('🟡 [Server] Set-Cookie Headers:', setCookieHeaders);

    const userData = await response.json();
    console.log('🟡 [Server] Login Response Body:', userData);

    // 백엔드가 보낸 쿠키를 클라이언트에 전달
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      const cookieStore = await cookies();

      setCookieHeaders.forEach((cookieString) => {
        // Set-Cookie 헤더 파싱
        const [nameValue, ...attributes] = cookieString.split(';');
        const [name, value] = nameValue.split('=').map((s) => s.trim());

        // 쿠키 속성 파싱
        const options: any = {
          httpOnly: false, // 기본값
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
        };

        attributes.forEach((attr) => {
          const [key, val] = attr.split('=').map((s) => s.trim());
          const lowerKey = key.toLowerCase();

          if (lowerKey === 'httponly') options.httpOnly = true;
          if (lowerKey === 'secure') options.secure = true;
          if (lowerKey === 'samesite') {
            const sameSiteVal = val?.toLowerCase();
            if (
              sameSiteVal === 'none' ||
              sameSiteVal === 'lax' ||
              sameSiteVal === 'strict'
            ) {
              options.sameSite = sameSiteVal;
            }
          }
          if (lowerKey === 'path') options.path = val;
          if (lowerKey === 'max-age') options.maxAge = parseInt(val, 10);
          if (lowerKey === 'expires') options.expires = new Date(val);
        });

        console.log(`🟢 [Server] Setting cookie: ${name}`, options);

        // SameSite=None이면 Secure 강제 설정
        if (options.sameSite === 'none') {
          options.secure = true;
          console.log(
            '⚠️ [Server] SameSite=None detected, forcing Secure=true'
          );
        }

        // 클라이언트에 쿠키 설정
        cookieStore.set(name, value, options);
      });
    }

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
      console.error(
        '🔴 [Server] OAuth login failed with status:',
        response.status
      );

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      console.log('🟡 [Server] Response Content-Type:', contentType);

      let errorMessage = 'OAuth 로그인에 실패했습니다.';

      // JSON 응답인 경우에만 파싱
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('🔴 [Server] JSON 파싱 실패:', parseError);
        }
      } else {
        // HTML 또는 다른 형식의 응답인 경우
        const errorText = await response.text();
        console.error(
          '🔴 [Server] Non-JSON response:',
          errorText.substring(0, 200)
        );

        // ngrok 에러 체크
        if (errorText.includes('ERR_NGROK')) {
          errorMessage =
            '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.';
        } else if (response.status === 404) {
          errorMessage =
            'OAuth API 엔드포인트를 찾을 수 없습니다. URL을 확인해주세요.';
        }
      }

      return {
        error: errorMessage,
      };
    }

    // OAuth에서도 쿠키 전달
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      const cookieStore = await cookies();

      setCookieHeaders.forEach((cookieString) => {
        const [nameValue, ...attributes] = cookieString.split(';');
        const [name, value] = nameValue.split('=').map((s) => s.trim());

        const options: any = {
          httpOnly: false,
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
        };

        attributes.forEach((attr) => {
          const [key, val] = attr.split('=').map((s) => s.trim());
          const lowerKey = key.toLowerCase();

          if (lowerKey === 'httponly') options.httpOnly = true;
          if (lowerKey === 'secure') options.secure = true;
          if (lowerKey === 'samesite')
            options.sameSite = val?.toLowerCase() || 'lax';
          if (lowerKey === 'path') options.path = val;
          if (lowerKey === 'max-age') options.maxAge = parseInt(val, 10);
          if (lowerKey === 'expires') options.expires = new Date(val);
        });

        cookieStore.set(name, value, options);
      });
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
