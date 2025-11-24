'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';

import { checkEmailAction } from '@/app/actions/auth-actions';
import { type EmailFormData, emailSchema } from '@/lib/validations/schemas';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface DuplicateEmailCheckProps {
  onEmailValidated: (email: string) => void;
}

export function DuplicateEmailCheck({
  onEmailValidated,
}: DuplicateEmailCheckProps) {
  const [emailInput, setEmailInput] = useState('');

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const [serverState, formAction, isPending] = useActionState(
    checkEmailAction,
    undefined
  );

  // 서버에 제출된 이메일 추적 (제출 시점에 저장)
  const submittedEmailRef = useRef('');

  // 현재 입력값이 제출된 값과 다른지 확인
  const isInputChanged = emailInput !== submittedEmailRef.current;

  // 이메일이 검증되었는지 확인 (성공 상태이고 입력이 변경되지 않음)
  const isEmailVerified = serverState?.success && !isInputChanged;

  // 서버 상태 변경 시 로그
  // useEffect(() => {
  //   console.log('🟡 [Client] serverState changed:', serverState);
  //   console.log('🟡 [Client] submittedEmail:', submittedEmailRef.current);
  //   console.log('🟡 [Client] currentEmail:', emailInput);
  //   console.log('🟡 [Client] isInputChanged:', isInputChanged);
  // }, [serverState, emailInput, isInputChanged]);

  // 폼 제출 전 처리 (다음 단계 이동 또는 이메일 저장)
  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      // 이미 검증된 상태면 다음 단계로 이동
      if (isEmailVerified) {
        e.preventDefault();
        // console.log('🟢 [Client] Moving to signup form...');
        onEmailValidated(emailInput);
        return;
      }

      // 검증되지 않았으면 제출 전에 이메일 저장
      submittedEmailRef.current = emailInput;
      // console.log(
      //   '🟢 [Client] Submitted email for verification:',
      //   submittedEmailRef.current
      // );
    },
    [isEmailVerified, emailInput, onEmailValidated]
  );

  // 입력 변경 핸들러
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmailInput(value);
      form.setValue('email', value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">이메일 확인</CardTitle>
        <CardDescription className="leading-relaxed">
          회원가입에 사용할 이메일 주소를 입력하고
          <br />
          중복 확인을 해주세요
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          action={formAction}
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              disabled={isPending || isEmailVerified}
              value={emailInput}
              onChange={handleEmailChange}
              autoComplete="email"
            />

            {/* 디버깅: 모든 조건 확인 */}
            {/* <div className="mt-2 text-xs text-gray-500">
              <p>디버그 정보:</p>
              <p>
                - 클라이언트 에러:{' '}
                {form.formState.errors.email ? '있음' : '없음'}
              </p>
              <p>- 서버 에러: {serverState?.errors?.email ? '있음' : '없음'}</p>
              <p>- 서버 성공: {serverState?.success ? '예' : '아니오'}</p>
              <p>- 입력 변경됨: {isInputChanged ? '예' : '아니오'}</p>
            </div> */}

            {/* 클라이언트 검증 에러 */}
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}

            {/* 서버 에러 */}
            {serverState?.errors?.email &&
              !form.formState.errors.email &&
              !isInputChanged && (
                <p className="text-sm text-red-600">
                  {serverState.errors.email[0]}
                </p>
              )}

            {/* 일반 서버 에러 */}
            {serverState?.message &&
              !serverState?.success &&
              !form.formState.errors.email &&
              !isInputChanged && (
                <p className="text-sm text-red-600">{serverState.message}</p>
              )}

            {/* 성공 메시지 */}
            {serverState?.success &&
              serverState?.message &&
              !isInputChanged && (
                <p className="text-sm font-medium text-green-600">
                  ✓ {serverState.message}
                </p>
              )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !!form.formState.errors.email}
          >
            {isPending
              ? '확인 중...'
              : isEmailVerified
                ? '다음 단계로 이동'
                : '이메일 중복 확인'}
          </Button>
        </form>

        {/* 로그인 페이지 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <a
              href="/signin"
              className="text-blue-600 underline hover:text-blue-800"
            >
              로그인하기
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
