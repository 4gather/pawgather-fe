import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseBackend } from '@/lib/utils/supabase-backend';
import { signupSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = signupSchema.safeParse({
      email: body.email,
      nickname: body.nickname,
      password: body.password,
      confirmPassword: body.password,
    });

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

    const { nickname, email, password } = validationResult.data;

    // 이메일 중복 체크
    const { data: existingUser } = await supabaseBackend
      .from('users') // backend_compat.users 테이블
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          status: 409,
          message: '이미 가입된 계정 입니다.',
          errorCode: 'CONFLICT_USER',
        },
        { status: 409 }
      );
    }

    // 닉네임 중복 체크
    const { data: existingNickname } = await supabaseBackend
      .from('users')
      .select('nick_name')
      .eq('nick_name', nickname)
      .single();

    if (existingNickname) {
      return NextResponse.json(
        {
          status: 409,
          message: '이미 존재하는 NickName 입니다.',
          errorCode: 'CONFLICT_NICKNAME',
        },
        { status: 409 }
      );
    }
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const { data: _newUser, error } = await supabaseBackend
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        nick_name: nickname,
        user_created_at: new Date().toISOString(),
        user_updated_at: new Date().toISOString(),
        status: 'active',
        role: 'user',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
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
