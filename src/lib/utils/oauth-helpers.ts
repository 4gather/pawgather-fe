import { NextResponse } from 'next/server';

import { generateAccessToken, generateRefreshToken } from '@/lib/utils/jwt';
import { supabaseBackend } from '@/lib/utils/supabase-backend';

// 공통 랜덤 데이터 생성 함수들
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateRandomNickname(): string {
  const adjectives = ['멋진', '귀여운', '똑똑한', '활발한', '친근한'];
  const nouns = ['사자', '토끼', '곰', '여우', '판다'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}${Math.floor(Math.random() * 1000)}`;
}

// 지원되는 OAuth 제공자 정의
const SUPPORTED_PROVIDERS = ['google', 'naver'] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

// Provider 검증 함수 추가
function isValidProvider(provider: string): provider is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(provider as SupportedProvider);
}

// 공통 OAuth 처리 함수
export async function processOAuthUser(provider: string) {
  try {
    // Provider 유효성 검증 추가
    if (!isValidProvider(provider)) {
      console.error(`❌ 지원하지 않는 OAuth 제공자: ${provider}`);
      return NextResponse.json(
        {
          status: 400,
          message: '지원하지 않는 OAuth2 제공자입니다.',
          errorCode: 'OAUTH_PROVIDER_NOT_SUPPORTED',
        },
        { status: 400 }
      );
    }

    // 랜덤 사용자 데이터 생성
    const randomId = generateRandomId();
    const email = `${randomId}@${provider === 'google' ? 'gmail.com' : 'naver.com'}`;
    const nickname = generateRandomNickname();

    console.log(`🔍 ${provider} OAuth Mock API 처리 시작:`, {
      email,
      nickname,
    });

    // 기존 사용자 확인
    const { data: existingUser, error: selectError } = await supabaseBackend
      .from('users')
      .select('user_id, email, nick_name, user_img')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ 사용자 조회 에러:', selectError);
      return NextResponse.json(
        {
          status: 500,
          message: 'OAuth 처리 중 오류가 발생했습니다.',
          errorCode: 'OAUTH_PROCESSING_ERROR',
        },
        { status: 500 }
      );
    }

    let userId: number;
    let userNickname: string;
    let userImg: string | null = null;

    if (existingUser) {
      // 기존 사용자 정보 업데이트
      console.log('✅ 기존 사용자 발견:', existingUser);
      const { error: updateError } = await supabaseBackend
        .from('users')
        .update({
          user_updated_at: new Date().toISOString(),
        })
        .eq('user_id', existingUser.user_id);

      if (updateError) {
        console.error('❌ 사용자 업데이트 에러:', updateError);
        return NextResponse.json(
          {
            status: 500,
            message: 'OAuth 처리 중 오류가 발생했습니다.',
            errorCode: 'OAUTH_PROCESSING_ERROR',
          },
          { status: 500 }
        );
      }

      userId = existingUser.user_id;
      userNickname = existingUser.nick_name;
      userImg = existingUser.user_img;
    } else {
      // 새 사용자 생성
      console.log('🆕 새 사용자 생성');
      const { data: newUser, error: insertError } = await supabaseBackend
        .from('users')
        .insert({
          email,
          password: '', // OAuth 사용자는 비밀번호 불필요
          nick_name: nickname,
          user_img: null,
          status: 'active',
          role: 'user',
          user_created_at: new Date().toISOString(),
          user_updated_at: new Date().toISOString(),
        })
        .select('user_id')
        .single();

      if (insertError) {
        console.error('❌ 사용자 생성 에러:', insertError);
        return NextResponse.json(
          {
            status: 500,
            message: 'OAuth 처리 중 오류가 발생했습니다.',
            errorCode: 'OAUTH_PROCESSING_ERROR',
          },
          { status: 500 }
        );
      }

      userId = newUser.user_id;
      userNickname = nickname;
    }

    // OAuth 정보 처리
    const oauthProviderId = `${provider}_${randomId}`;
    const { data: existingOAuth } = await supabaseBackend
      .from('oauth')
      .select('oauth_id')
      .eq('oauth_provider', provider)
      .eq('oauth_provider_id', oauthProviderId)
      .single();

    if (!existingOAuth) {
      const { error: oauthError } = await supabaseBackend.from('oauth').insert({
        oauth_provider_id: oauthProviderId,
        oauth_provider: provider,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (oauthError) {
        console.error('❌ OAuth 정보 생성 에러:', oauthError);
        return NextResponse.json(
          {
            status: 500,
            message: 'OAuth 처리 중 오류가 발생했습니다.',
            errorCode: 'OAUTH_PROCESSING_ERROR',
          },
          { status: 500 }
        );
      }
    }

    // JWT 토큰 생성
    const tokenPayload = {
      userId: userId.toString(),
      email,
      provider,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 응답 생성
    const response = NextResponse.json(
      {
        accessToken,
        provider,
        email,
        nickname: userNickname,
        userImg: userImg,
      },
      { status: 200 }
    );

    // HTTP-only 쿠키로 리프레시 토큰 설정
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error(`💥 ${provider} OAuth 처리 중 예외:`, error);
    return NextResponse.json(
      {
        status: 500,
        message: 'OAuth 처리 중 오류가 발생했습니다.',
        errorCode: 'OAUTH_PROCESSING_ERROR',
      },
      { status: 500 }
    );
  }
}
