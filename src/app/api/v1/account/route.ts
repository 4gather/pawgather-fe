import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateAccessToken, generateRefreshToken } from '@/lib/utils/jwt';
import { supabaseBackend } from '@/lib/utils/supabase-backend';
import { loginSchema } from '@/lib/validations/schemas';

// 로그인 - POST 메서드
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 로그인 스키마로 검증
    const validationResult = loginSchema.safeParse({
      email: body.email,
      password: body.password,
    });

    if (!validationResult.success) {
      const flattenErrors = z.flattenError(validationResult.error);
      const firstErrorMessage =
        flattenErrors.fieldErrors.email?.[0] ||
        flattenErrors.fieldErrors.password?.[0] ||
        '입력 정보를 확인해주세요.';

      return NextResponse.json(
        {
          status: 400,
          code: 'VALIDATION_FAILED',
          message: firstErrorMessage,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // 사용자 조회
    const { data: user, error: userError } = await supabaseBackend
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          status: 404,
          code: 'NOT_FOUND_USER',
          message: '존재하지 않는 계정입니다.',
        },
        { status: 404 }
      );
    }

    // 비밀번호 검증
    let isValidPassword = false;

    // 1. bcrypt 해시 비교 시도
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('해시 비밀번호 검증 결과:', isValidPassword);
    } catch (error) {
      console.log('해시 비밀번호 검증 실패:', error);
    }

    // 2. 해시 비교가 실패했다면 평문 비교 시도
    if (!isValidPassword) {
      console.log('평문 비밀번호 검증 시도');
      isValidPassword = password === user.password;
      console.log('평문 비밀번호 검증 결과:', isValidPassword);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        {
          status: 401,
          code: 'INVALID_PASSWORD',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const tokenPayload = {
      userId: user.user_id.toString(),
      email: user.email,
      provider: user.provider || null,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response = NextResponse.json({
      accessToken,
      provider: user.provider || null,
      email: user.email,
      nickName: user.nick_name,
      userImg: user.user_img || null,
    });

    // 리프레시 토큰을 HTTP-only 쿠키로 설정
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// 로그아웃 - GET 메서드
export async function GET(request: NextRequest) {
  try {
    console.log('🟡 로그아웃 GET 요청 수신');

    // 인증 토큰 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('🔴 Authorization 헤더 없음');
      return NextResponse.json(
        {
          status: 401,
          message: '인증이 필요합니다.',
        },
        { status: 401 }
      );
    }

    // Bearer 토큰 형식 검증
    if (!authHeader.startsWith('Bearer ')) {
      console.error('🔴 잘못된 Authorization 헤더 형식');
      return NextResponse.json(
        {
          status: 401,
          message: '올바르지 않은 인증 형식입니다.',
        },
        { status: 401 }
      );
    }

    // Access Token 추출 및 검증
    const accessToken = authHeader.replace('Bearer ', '');
    if (!accessToken) {
      console.error('🔴 Access Token 없음');
      return NextResponse.json(
        {
          status: 401,
          message: '인증 토큰이 필요합니다.',
        },
        { status: 401 }
      );
    }

    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!refreshToken) {
      // 리프레시 토큰이 없어도 로그아웃은 진행 (클라이언트 정리를 위해)
      console.warn('No refresh token found during logout');
    } else {
      // 추가 로직: 서버에서 refresh token 무효화
      console.log(
        'Invalidating refresh token:',
        refreshToken.substring(0, 10) + '...'
      );
      // TODO: 실제 구현시 DB에서 refresh token 제거 또는 블랙리스트 추가
    }

    // 로그아웃 성공 응답 (API 명세서에 따라 204 상태)
    const response = new NextResponse(null, {
      status: 204,
      statusText: 'No Content',
    });

    // 리프레시 토큰 쿠키 삭제
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // 즉시 만료
      path: '/',
    });

    console.log('🟢 로그아웃 성공');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        status: 500,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
