// src/components/common/LoadingScreen.tsx

import { LoadingSpinner } from './LoadingSpinner';

export function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-primary">Talkify</h1>
      <LoadingSpinner size="lg" />
    </div>
  );
}