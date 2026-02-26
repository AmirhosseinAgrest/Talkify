// src/pages/auth/LoginPage.tsx

import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
      <LoginForm />
    </>
  );
}