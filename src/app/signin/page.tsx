import { SigninForm } from '@/components/signin/signin-form';

export default function SignInPage() {
  return (
    <div
      className="flex items-center justify-center px-4"
      style={{ height: 'calc(100vh - 130px)' }}
    >
      <SigninForm />
    </div>
  );
}
