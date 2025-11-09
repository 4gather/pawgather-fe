import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseBackend } from '@/lib/utils/supabase-backend';
import { nicknameSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = nicknameSchema.safeParse(body);

    if (!validationResult.success) {
      const flattenErrors = z.flattenError(validationResult.error);
      const firstErrorMessage =
        flattenErrors.fieldErrors.nickname?.[0] || '검증 오류가 발생했습니다.';
      return NextResponse.json(
        {
          status: 400,
          message: firstErrorMessage,
          errorCode: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const { nickname } = validationResult.data;

    // 중복 체크
    const { data, error: _error } = await supabaseBackend
      .from('users') // backend_compat.users 테이블
      .select('nick_name')
      .eq('nick_name', nickname)
      .single();

    if (data) {
      return NextResponse.json(
        {
          status: 409,
          message: '이미 존재하는 NickName 입니다.',
          errorCode: 'CONFLICT_NICKNAME',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ status: 200 }, { status: 200 });
  } catch (error) {
    console.error('Nickname check error:', error);
    return NextResponse.json(
      {
        status: 500,
        message: '서버 오류가 발생했습니다.',
        errorCode: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
