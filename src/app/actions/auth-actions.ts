'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import {
  emailSchema,
  nicknameSchema,
  signupSchema,
} from '@/lib/validations/schemas';

// 타입 정의
export type EmailCheckResult = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
  };
};

export type NicknameCheckResult = {
  success: boolean;
  message?: string;
  errors?: {
    nickname?: string[];
  };
};

export type SignupResult = {
  success: boolean;
  message?: string;
  userData?: {
    email: string;
    nickname: string;
  };
  errors?: {
    email?: string[];
    nickname?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export type LogoutState = {
  success?: boolean;
  error?: string;
} | null;

// 이메일 중복 체크 Server Action
export async function checkEmailAction(
  _prevState: EmailCheckResult | undefined,
  formData: FormData
): Promise<EmailCheckResult> {
  try {
    // FormData 확인
    // const emailFromForm = formData.get('email');
    // console.log('🟡 [Server] Received email:', emailFromForm);

    const validatedFields = emailSchema.safeParse({
      email: formData.get('email'),
    });

    if (!validatedFields.success) {
      const flattenErrors = z.flattenError(validatedFields.error);
      // console.log('🔴 [Server] Validation error:', flattenErrors);
      return {
        success: false,
        errors: flattenErrors.fieldErrors,
      };
    }

    const { email } = validatedFields.data;
    // console.log('🟢 [Server] Validated email:', email);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/signup/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');

      // JSON 응답인 경우에만 파싱
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          if (errorData.code === 'CONFLICT_EMAIL') {
            return {
              success: false,
              errors: {
                email: ['이미 존재하는 Email 입니다.'],
              },
            };
          }

          if (errorData.code === 'INVALID_FORMAT_EMAIL') {
            return {
              success: false,
              errors: {
                email: ['email 형식을 지켜주세요.'],
              },
            };
          }

          return {
            success: false,
            message: errorData.message || '이메일 확인 중 오류가 발생했습니다.',
          };
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
          return {
            success: false,
            message:
              '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.',
          };
        }
      }

      return {
        success: false,
        message: '이메일 확인 중 오류가 발생했습니다.',
      };
    }

    return {
      success: true,
      message: '사용 가능한 이메일입니다.',
    };
  } catch (error) {
    console.error('Email check error:', error);
    return {
      success: false,
      message: '서버와의 통신에 실패했습니다.',
    };
  }
}

// 닉네임 중복 체크 Server Action
export async function checkNicknameAction(
  _prevState: NicknameCheckResult | undefined,
  formData: FormData
): Promise<NicknameCheckResult> {
  try {
    const validatedFields = nicknameSchema.safeParse({
      nickname: formData.get('nickname'),
    });

    if (!validatedFields.success) {
      const flattenErrors = z.flattenError(validatedFields.error);
      return {
        success: false,
        errors: flattenErrors.fieldErrors,
      };
    }

    const { nickname } = validatedFields.data;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/signup/nickname`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      }
    );

    if (!response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');

      // JSON 응답인 경우에만 파싱
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();

          if (errorData.code === 'CONFLICT_NICKNAME') {
            return {
              success: false,
              errors: {
                nickname: ['이미 존재하는 NickName 입니다.'],
              },
            };
          }

          if (errorData.code === 'INVALID_FORMAT_NICKNAME') {
            return {
              success: false,
              errors: {
                nickname: ['nickname 형식을 지켜주세요.'],
              },
            };
          }

          return {
            success: false,
            message: errorData.message || '닉네임 확인 중 오류가 발생했습니다.',
          };
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
          return {
            success: false,
            message:
              '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.',
          };
        }
      }

      return {
        success: false,
        message: '닉네임 확인 중 오류가 발생했습니다.',
      };
    }

    return {
      success: true,
      message: '사용 가능한 닉네임입니다.',
    };
  } catch (error) {
    console.error('Nickname check error:', error);
    return {
      success: false,
      message: '서버와의 통신에 실패했습니다.',
    };
  }
}

// 회원가입 Server Action (수동 로그인)
export async function signupAction(
  _prevState: SignupResult | undefined,
  formData: FormData
): Promise<SignupResult> {
  try {
    const validatedFields = signupSchema.safeParse({
      email: formData.get('email'),
      nickname: formData.get('nickname'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
      const flattenErrors = z.flattenError(validatedFields.error);
      return {
        success: false,
        errors: flattenErrors.fieldErrors,
      };
    }

    const { email, nickname, password } = validatedFields.data;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
        }),
      }
    );

    if (!response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');

      // JSON 응답인 경우에만 파싱
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();

          if (errorData.code === 'CONFLICT_USER') {
            return {
              success: false,
              errors: {
                email: ['이미 가입된 계정입니다.'],
              },
            };
          }

          if (errorData.code === 'VALIDATION_ERROR') {
            return {
              success: false,
              message: errorData.message,
            };
          }

          return {
            success: false,
            message: errorData.message || '회원가입에 실패했습니다.',
          };
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
          return {
            success: false,
            message:
              '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.',
          };
        }
      }

      return {
        success: false,
        message: '회원가입에 실패했습니다.',
      };
    }

    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      userData: {
        email,
        nickname,
      },
    };
  } catch (error) {
    console.error('Signup action error:', error);
    return {
      success: false,
      message: '서버와의 통신에 실패했습니다.',
    };
  }
}

// 로그아웃 Server Action
export async function logoutAction(
  _prevState: LogoutState,
  formData: FormData
): Promise<LogoutState> {
  try {
    // FormData에서 accessToken 추출
    const accessToken = formData.get('accessToken') as string;
    console.log('🟡 [Server] Logout Action 호출');
    console.log('🟡 [Server] AccessToken 존재:', !!accessToken);
    console.log('🟡 [Server] AccessToken 전체:', accessToken);
    console.log('🟡 [Server] AccessToken 길이:', accessToken?.length);
    console.log('🟡 [Server] Bearer 헤더:', `Bearer ${accessToken}`);
    if (!accessToken) {
      console.error('🔴 Access Token이 제공되지 않았습니다');
      return {
        error: '인증 정보가 없습니다.',
      };
    }

    // 클라이언트의 쿠키 읽기 (refreshToken)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log(
      '🟡 [Server] 현재 쿠키 목록:',
      allCookies.map((c) => c.name)
    );

    // refreshToken 찾기 (이름은 백엔드에서 사용하는 쿠키 이름과 동일해야 함)
    const refreshTokenCookie = cookieStore.get('refreshToken');
    console.log('🟡 [Server] RefreshToken 쿠키:', refreshTokenCookie);

    // Cookie 헤더 구성
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('🟡 [Server] Cookie 헤더:', cookieHeader);

    console.log('🟡 [Server] Logout API 요청 시작');
    console.log(
      '🟡 [Server] URL:',
      `${process.env.NEXT_PUBLIC_BASE_URL}/account`
    );

    // 백엔드 로그아웃 API 호출 (Authorization 헤더 포함)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      {
        method: 'GET',
        credentials: 'include', // 쿠키 포함하여 refresh token 삭제
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
      }
    );

    console.log('🟡 [Server] Logout API 응답:', response.status);
    console.log(
      '🟡 [Server] Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      console.log('🔴 [Server] Logout failed with status:', response.status);

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      let errorData;

      try {
        // JSON 응답인 경우에만 파싱
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          console.error('🔴 [Server] Logout API error (JSON):', errorData);
        } else {
          // HTML 또는 다른 형식의 응답인 경우
          errorData = await response.text();
          console.error(
            '🔴 [Server] Logout API error (Text):',
            errorData.substring(0, 200)
          );

          // ngrok 에러 메시지 체크
          if (errorData.includes('ERR_NGROK')) {
            return {
              error:
                '백엔드 서버에 연결할 수 없습니다. ngrok 터널을 확인해주세요.',
            };
          }
        }
      } catch (parseError) {
        // 응답 파싱 실패 처리
        console.error('🔴 [Server] 응답 파싱 실패:', parseError);
      }

      return {
        error: '로그아웃에 실패했습니다.',
      };
    }

    console.log('🟢 로그아웃 API 성공');

    // 서버 쪽 쿠키도 삭제
    allCookies.forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });
    console.log('🟢 [Server] 모든 쿠키 삭제 완료');

    // 성공적으로 로그아웃 완료
    return {
      success: true,
    };
  } catch (error) {
    console.error('🔴 Logout action error:', error);
    return {
      error: '로그아웃 중 오류가 발생했습니다.',
    };
  }
}
