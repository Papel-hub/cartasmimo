// app/midia/page.tsx
import { Suspense } from 'react';
import MidiaClient from './MidiaClient';

export default function MidiaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"></div>}>
      <MidiaClient searchParams={searchParams} />
    </Suspense>
  );
}