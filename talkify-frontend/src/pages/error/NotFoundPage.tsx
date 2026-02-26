// src/pages/error/NotFoundPage.tsx

import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page not found!</h2>
      <p className="text-muted-foreground mt-2">
        The page you're looking for does not exist
      </p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}