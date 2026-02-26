// src/pages/auth/RegisterPage.tsx

import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">Create a New Account</h2>
      <RegisterForm />
    </>
  );
}