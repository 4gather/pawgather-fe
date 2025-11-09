import { CheckCircle, Home, LogIn } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface SignupSuccessProps {
  email?: string;
  nickname?: string;
}

export function SignupSuccess({ email, nickname }: SignupSuccessProps) {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-green-600">회원가입 완료!</CardTitle>
        <CardDescription>계정이 성공적으로 생성되었습니다</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {(email || nickname) && (
          <div className="rounded-lg bg-gray-50 p-4">
            {email && (
              <>
                <div className="mb-1 text-sm text-gray-600">가입 이메일</div>
                <div className="font-medium">{email}</div>
              </>
            )}
            {nickname && (
              <>
                <div className="mt-2 mb-1 text-sm text-gray-600">닉네임</div>
                <div className="font-medium">{nickname}</div>
              </>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600">
          이제 새로운 계정으로 로그인하여 <br /> 서비스를 이용하실 수 있습니다
        </p>

        <div className="flex flex-col gap-2">
          <Button className="w-full" asChild>
            <Link href="/signin">
              <LogIn className="mr-2 h-4 w-4" />
              로그인하러 가기
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로 이동
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
