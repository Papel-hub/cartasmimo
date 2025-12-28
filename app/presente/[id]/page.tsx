'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PresenteRedirect({ params }: PageProps) {
  const router = useRouter();
  
  // No Next.js 15, usamos o hook 'use' para desembrulhar a Promise de params
  const { id } = use(params);

  useEffect(() => {
    // Verificamos o tamanho da tela apenas no cliente
    const isDesktop = window.innerWidth >= 768;
    
    // Redirecionamos usando o router do cliente
    router.replace(`/presente/${id}/${isDesktop ? 'desktop' : 'mobile'}`);
  }, [id, router]);

  // Enquanto redireciona, você pode exibir um loading simples
  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-900"></div>
    </div>
  );
}