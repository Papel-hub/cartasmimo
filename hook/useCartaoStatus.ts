// hooks/useCartaoStatus.ts
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig'; // certifique-se de exportar `db` (Firestore)

export function useCartaoStatus() {
  const [hasCartao, setHasCartao] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Usuário não logado → não tem cartão
        setHasCartao(false);
        setLoading(false);
        return;
      }

      try {
        // Busca o documento do usuário no Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Verifica se o campo `card` existe (pode ser booleano, objeto, etc.)
          const hasCard = userData.card !== undefined && userData.card !== null;
          setHasCartao(hasCard);
        } else {
          // Documento não existe → não tem cartão
          setHasCartao(false);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setError('Falha ao verificar cartão');
        setHasCartao(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { hasCartao, loading, error };
}