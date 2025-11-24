import { NextRequest, NextResponse } from 'next/server';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '@/lib/utils/jwt';
import { supabaseBackend } from '@/lib/utils/supabase-backend';

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 액세스 토큰 검증 추가
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '');
      // 액세스 토큰이 제공된 경우 유효성 검사
      const accessPayload = verifyToken(accessToken, 'access');
      if (!accessPayload) {
        console.log('🔴 INVALID_ACCESS_TOKEN: 액세스 토큰 무효');
        return NextResponse.json(
          {
            status: 401,
            code: 'INVALID_ACCESS_TOKEN',
            message: '다시 로그인을 진행해주세요.',
          },
          { status: 401 }
        );
      }
    }

    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken =
      request.cookies.get('refresh-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!refreshToken) {
      return NextResponse.json(
        {
          status: 401,
          code: 'INVALID_BEARER',
          message: '다시 로그인을 진행해주세요.',
        },
        { status: 401 }
      );
    }

    // 리프레시 토큰 검증
    const payload = verifyToken(refreshToken, 'refresh');
    if (!payload) {
      return NextResponse.json(
        {
          status: 401,
          code: 'EXPIRED_VALIDITY_REFRESH_TOKEN',
          message: '다시 로그인을 진행해주세요.',
        },
        { status: 401 }
      );
    }

    // 사용자 존재 여부 확인 추가
    const { data: user, error: userError } = await supabaseBackend
      .from('users')
      .select('user_id, email, nick_name, status')
      .eq('user_id', payload.userId)
      .eq('status', 'active') // 활성 사용자만
      .single();

    // 사용자를 찾을 수 없거나 비활성화된 경우 404 반환
    if (userError || !user) {
      console.log('🔴 사용자 정보 없음:', payload.userId);
      return NextResponse.json(
        {
          status: 404,
          code: 'NOT_FOUND_USER',
          message: '로그인을 진행해주세요.',
        },
        { status: 404 }
      );
    }

    // 새로운 토큰 쌍 생성
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      provider: payload.provider,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // 새로운 리프레시 토큰을 쿠키에 설정
    const response = NextResponse.json({
      accessToken: newAccessToken,
    });

    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
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
