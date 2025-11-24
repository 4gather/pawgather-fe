'use client';

import { useState } from 'react';

import { DuplicateEmailCheck } from './duplicate-email-check';
import { SignupForm } from './signup-form';
import { SignupSuccess } from './signup-success';

type SignupStep = 'email-check' | 'signup' | 'success';

interface UserData {
  email: string;
  nickname: string;
}

export function SignupWrapper() {
  // 2단계 플로우 상태 관리
  const [currentStep, setCurrentStep] = useState<SignupStep>('email-check');
  const [validatedEmail, setValidatedEmail] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);

  // 이메일 검증 성공 시 다음 단계로 이동
  const handleEmailValidated = (email: string) => {
    setValidatedEmail(email);
    setCurrentStep('signup'); // 2단계로 전환
  };

  // 이메일 재입력을 위해 1단계로 돌아가기
  const handleBackToEmailCheck = () => {
    setCurrentStep('email-check');
    setValidatedEmail('');
    setUserData(null);
  };

  // 회원가입 성공 시 success 단계로 이동
  const handleSignupSuccess = (userData: UserData) => {
    setUserData(userData);
    setCurrentStep('success');
  };

  return (
    <div
      className="flex items-center justify-center p-4"
      style={{ height: 'calc(100vh - 130px)' }}
    >
      {/* 단계별 조건부 렌더링 */}
      {currentStep === 'email-check' ? (
        // 1단계: 이메일 중복 확인만 표시
        <DuplicateEmailCheck onEmailValidated={handleEmailValidated} />
      ) : currentStep === 'signup' ? (
        // 2단계: 회원가입 폼 표시 (검증된 이메일 포함)
        <SignupForm
          validatedEmail={validatedEmail}
          onBackToEmailCheck={handleBackToEmailCheck}
          onSignupSuccess={handleSignupSuccess}
        />
      ) : (
        // 3단계: 회원가입 성공 표시
        <SignupSuccess email={userData?.email} nickname={userData?.nickname} />
      )}
    </div>
  );
}
