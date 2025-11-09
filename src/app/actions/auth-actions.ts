'use server';

import { z } from 'zod';

import { supabaseBackend } from '@/lib/utils/supabase-backend';
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

    // backend_compat.users 테이블에서 중복 체크
    // console.log('🟡 [Server] Querying Supabase...');
    const { data, error } = await supabaseBackend
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    // console.log('🟡 [Server] result.data:', data);
    // console.log('🟡 [Server] result.error:', error);

    // 실제 데이터베이스 에러가 발생한 경우만 에러 처리
    if (error) {
      console.error('🔴 [Server] Database error:', error);
      return {
        success: false,
        message: '서버 오류가 발생했습니다.',
      };
    }

    if (data) {
      // console.log('🔴 [Server] Email already exists!');
      return {
        success: false,
        errors: { email: ['이미 존재하는 이메일입니다.'] },
      };
    }

    // console.log('🟢 [Server] Email is available!');
    return {
      success: true,
      message: '사용 가능한 이메일입니다.',
    };
  } catch (error) {
    console.error('🔴 [Server] Unexpected error:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.',
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

    // backend_compat.users 테이블에서 중복 체크
    const { data, error } = await supabaseBackend
      .from('users')
      .select('nick_name')
      .eq('nick_name', nickname)
      .maybeSingle();

    // 실제 데이터베이스 에러가 발생한 경우만 에러 처리
    if (error) {
      console.error('Nickname check database error:', error);
      return {
        success: false,
        message: '서버 오류가 발생했습니다.',
      };
    }

    if (data) {
      return {
        success: false,
        errors: { nickname: ['이미 존재하는 닉네임입니다.'] },
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
      message: '서버 오류가 발생했습니다.',
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

    // 1. 이메일 중복 재확인
    const { data: existingUser } = await supabaseBackend
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return {
        success: false,
        errors: { email: ['이미 가입된 계정입니다.'] },
      };
    }

    // 2. 닉네임 중복 재확인
    const { data: existingNickname } = await supabaseBackend
      .from('users')
      .select('nick_name')
      .eq('nick_name', nickname)
      .maybeSingle();

    if (existingNickname) {
      return {
        success: false,
        errors: { nickname: ['이미 존재하는 닉네임입니다.'] },
      };
    }

    // 3. 사용자 생성
    const { error } = await supabaseBackend.from('users').insert({
      email,
      password: password,
      nick_name: nickname,
      user_created_at: new Date().toISOString(),
      user_updated_at: new Date().toISOString(),
      status: 'active',
      role: 'user',
    });

    if (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
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
      message: '서버 오류가 발생했습니다.',
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

    if (!accessToken) {
      console.error('🔴 Access Token이 제공되지 않았습니다');
      return {
        error: '인증 정보가 없습니다.',
      };
    }

    // console.log('🟡 로그아웃 API 호출 시작');

    // 백엔드 로그아웃 API 호출 (Authorization 헤더 포함)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      {
        method: 'GET', // 로그아웃은 GET 요청
        credentials: 'include', // 쿠키 포함하여 refresh token 삭제
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔴 Logout API error:', errorData);
      return {
        error: '로그아웃에 실패했습니다.',
      };
    }

    // console.log('🟢 로그아웃 API 성공');

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
