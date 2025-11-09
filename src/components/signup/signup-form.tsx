'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';

import { checkNicknameAction, signupAction } from '@/app/actions/auth-actions';
import { type SignupFormData, signupSchema } from '@/lib/validations/schemas';
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

interface SignupFormProps {
  validatedEmail: string;
  onBackToEmailCheck: () => void;
  onSignupSuccess: (userData: { email: string; nickname: string }) => void;
}

export function SignupForm({
  validatedEmail,
  onBackToEmailCheck,
  onSignupSuccess,
}: SignupFormProps) {
  // React Hook Form 설정
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // 실시간 검증 활성화
    defaultValues: {
      email: validatedEmail,
      nickname: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [serverState, formAction, isPending] = useActionState(
    signupAction,
    undefined
  );

  const [nicknameCheckState, nicknameCheckAction, isNicknameChecking] =
    useActionState(checkNicknameAction, undefined);

  const [isTransitionPending, startTransition] = useTransition();
  const [nicknameStatus, setNicknameStatus] = useState<
    'idle' | 'available' | 'taken' | 'error'
  >('idle');

  // 서버 에러 처리
  useEffect(() => {
    if (serverState && !serverState.success && serverState.errors) {
      Object.entries(serverState.errors).forEach(([field, messages]) => {
        if (messages && Array.isArray(messages) && messages.length > 0) {
          form.setError(field as keyof SignupFormData, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  }, [serverState, form]);

  // 서버 상태 성공 처리
  useEffect(() => {
    if (serverState?.success && serverState.userData) {
      // 회원가입 성공 시 success 컴포넌트로 이동
      onSignupSuccess(serverState.userData);
    }
  }, [serverState, onSignupSuccess]);

  // 닉네임 확인 결과 처리
  useEffect(() => {
    if (nicknameCheckState?.success) {
      setNicknameStatus('available');
    } else if (
      nicknameCheckState &&
      !nicknameCheckState.success &&
      nicknameCheckState.errors?.nickname
    ) {
      setNicknameStatus('taken');
    } else if (nicknameCheckState && !nicknameCheckState.success) {
      setNicknameStatus('error');
    }
  }, [nicknameCheckState]);

  // 닉네임 중복 확인 함수
  const handleNicknameCheck = useCallback(() => {
    const currentNickname = form.getValues('nickname');

    // 클라이언트 검증 먼저 수행
    if (!currentNickname || currentNickname.trim().length < 3) {
      form.setError('nickname', {
        type: 'manual',
        message: 'nickname은 3자 이상 입력해주세요',
      });
      return;
    }

    if (currentNickname.trim().length > 20) {
      form.setError('nickname', {
        type: 'manual',
        message: 'nickname은 20자 이하로 입력해주세요',
      });
      return;
    }

    // 정규식 검증
    if (!/^[a-zA-Z0-9\uAC00-\uD7A3_]+$/u.test(currentNickname.trim())) {
      form.setError('nickname', {
        type: 'manual',
        message:
          'nickname은 영문, 숫자, 완성된 한글, 언더바(_)만 사용할 수 있습니다',
      });
      return;
    }

    // 클라이언트 검증 통과 시에만 서버 확인
    startTransition(() => {
      const formData = new FormData();
      formData.append('nickname', currentNickname.trim());
      setNicknameStatus('idle');
      nicknameCheckAction(formData);
    });
  }, [form, nicknameCheckAction]);

  // 닉네임 입력 시 상태 초기화 (React Hook Form 연동)
  const handleNicknameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // React Hook Form의 onChange 호출 (validation 트리거)
      form.setValue('nickname', value, {
        shouldValidate: true, // 실시간 검증 트리거
        shouldDirty: true,
      });

      // 닉네임 상태 초기화
      setNicknameStatus('idle');

      // 서버 에러 클리어
      if (form.formState.errors.nickname?.type === 'server') {
        form.clearErrors('nickname');
      }
    },
    [form]
  );

  // 닉네임 상태 표시 함수
  const getNicknameStatusDisplay = () => {
    switch (nicknameStatus) {
      case 'available':
        return {
          message: '사용 가능한 닉네임입니다',
          className: 'text-green-600',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        };
      case 'taken':
        return {
          message: '이미 존재하는 닉네임입니다',
          className: 'text-red-600',
          icon: <X className="h-4 w-4 text-red-600" />,
        };
      case 'error':
        return {
          message: '확인 중 오류가 발생했습니다',
          className: 'text-red-600',
          icon: <X className="h-4 w-4 text-red-600" />,
        };
      default:
        return null;
    }
  };

  const nicknameStatusDisplay = getNicknameStatusDisplay();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="relative flex w-full items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToEmailCheck}
            className="absolute left-0 p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex w-full flex-col gap-2 text-center">
            <CardTitle className="text-lg">회원가입</CardTitle>
            <CardDescription>나머지 정보를 입력해주세요</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>사용 가능한 이메일</Label>
            <div className="flex items-center gap-2">
              <Input value={validatedEmail} disabled className="bg-gray-50" />
              <div className="text-sm font-medium text-green-600">✓</div>
            </div>
            <input type="hidden" name="email" value={validatedEmail} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="flex gap-2">
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                {...form.register('nickname')}
                onChange={handleNicknameChange}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleNicknameCheck}
                disabled={
                  isNicknameChecking ||
                  isTransitionPending ||
                  !form.watch('nickname') ||
                  form.watch('nickname').trim().length < 3 ||
                  !!form.formState.errors.nickname
                }
                variant="outline"
                className="shrink-0"
              >
                {isNicknameChecking || isTransitionPending
                  ? '확인중...'
                  : '중복확인'}
              </Button>
            </div>

            {/* 클라이언트 검증 에러 표시 */}
            {form.formState.errors.nickname && (
              <p className="text-sm text-red-600">
                {form.formState.errors.nickname.message}
              </p>
            )}

            {/* 서버 검증 결과 */}
            {nicknameStatusDisplay && !form.formState.errors.nickname && (
              <div
                className={`flex items-center gap-2 text-sm ${nicknameStatusDisplay.className}`}
              >
                {nicknameStatusDisplay.icon}
                <span>{nicknameStatusDisplay.message}</span>
              </div>
            )}

            {/* 서버 에러 표시 */}
            {serverState?.errors?.nickname && (
              <p className="text-sm text-red-600">
                {serverState.errors.nickname[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              {...form.register('password')}
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              {...form.register('confirmPassword')}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverState?.message && !serverState?.success && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {serverState.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              !form.formState.isValid ||
              isPending ||
              nicknameStatus !== 'available' // ✅ 닉네임 확인 완료 시에만 활성화
            }
          >
            {isPending ? '회원가입 중...' : '회원가입 완료'}
          </Button>
        </form>

        {/* 
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {nicknameStatus === 'available'
              ? '닉네임 확인이 완료되었습니다. 회원가입을 진행하세요.'
              : '닉네임 중복 확인을 먼저 해주세요.'}
          </p>
        </div> */}
      </CardContent>
    </Card>
  );
}
