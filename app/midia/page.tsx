// app/midia/page.tsx
import { Suspense } from 'react';
import MidiaClient from './MidiaClient';

export default function MidiaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-900 border-r-transparent"></div>
    </div>}>
      <MidiaClient searchParams={searchParams} />
    </Suspense>
  );
}