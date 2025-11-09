import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          status: 401,
          message: '인증이 필요합니다.',
        },
        { status: 401 }
      );
    }

    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = request.cookies.get('refresh-token')?.value;

    // refreshToken 활용 - 로그아웃 전 검증
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

    // 로그아웃은 클라이언트에서 처리하고 쿠키만 삭제
    const response = NextResponse.json({}, { status: 204 });

    // 리프레시 토큰 쿠키 삭제
    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // 즉시 만료
      path: '/',
    });

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
